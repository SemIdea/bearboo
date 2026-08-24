# Rubric — where Zod (or a parser) enters

## The single rule

A schema parser (Zod or the stack equivalent) **validates in exactly 2 places**:

1. **A procedure / transport handler input** — request → validated type.
2. **Parsing an external payload** — a webhook, a crawled source, an env var, a queue message, DB JSON with an unknown shape.

**The domain receives an already-validated, typed shape.** A pure lib idem. Re-validating inside the domain "just in case" duplicates the schema's source of truth.

## Why this rule

- **Validating 2× is waste** (CPU + maintaining the schema in 2 places).
- **The domain tests logic, not parsing.** A mock input with the wrong type does not compile — TS is already the barrier.
- **The schema lives near the boundary** where external data arrives — where it is needed, not where "it could be nice".

## Examples

### ✅ A procedure validates the input before calling the domain

```ts
const router_apps = router({
  procedure_createApps: publicProcedure
    .input(z.object({
      packageName: z.string().min(1),
      schemaUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      // input is already { packageName: string; schemaUrl: string }
      const result = await domain_createApps({ ctx, input });
      // ...
    }),
});
```

### ✅ A webhook handler validates the external payload

```ts
export async function POST(req: Request) {
  const raw = await req.text();
  const event = stripe_verifyWebhook(raw, signature);  // validates the signature
  const payload = zStripeEvent.parse(event);            // validates the shape
  await domain_handleStripeEventBillings({ ctx, input: payload });
}
```

### ❌ The domain re-validating "just in case"

```ts
async function domain_createApps({ ctx, input }: DomainInput<{ packageName: string; schemaUrl: string }>) {
  // ❌ the procedure already validated; this is noise + schema duplication
  const validated = z.object({
    packageName: z.string().min(1),
    schemaUrl: z.string().url(),
  }).parse(input);
}
```

### ✅ A pure lib receives a shape, does not validate

```ts
// lib/sdk-generator/index.ts
export function generateSdk({ schema, options }: { schema: OpenApiV3; options: GenOpts }): SdkFiles {
  // does not call z.parse — the schema arrives validated from the caller
  // if the caller passed the wrong shape, it is the caller's bug, not the lib's defense
}
```

## When "validate at the boundary" grows

If a procedure has 6 similar procedures all validating the same `apps` shape:

- Extract the schema to `src/server/modules/apps/schemas.ts`.
- Each procedure imports it: `.input(zCreateAppsInput)`.
- The schema is still declared **once**, but reused.
- It is still the boundary — just not duplicated.

## Additional anti-patterns

- ❌ Validating an input inside a domain function "for DI / defense in depth" — TS + the schema at the boundary already cover it.
- ❌ A schema declared inside the domain file — it goes to `schemas.ts` or `*.types.ts` in the module (hard rule 7).
- ❌ `z.unknown().parse(...)` to escape a type — it validates nothing, false safety. Use a real `z.object({...})` or accept the upstream type.
- ❌ Validating env via `process.env.X || throw` scattered around — centralize it in `src/server/env.ts` with Zod, validate 1× at boot.
