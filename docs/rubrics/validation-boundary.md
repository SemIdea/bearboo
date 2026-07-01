# Rubrica — onde Zod (ou parser) entra

## Regra única

Schema parser (Zod ou equivalente do stack) **valida em exatamente 2 lugares**:

1. **Input de procedure / handler de transport** — request → tipo validado.
2. **Parsing de payload externo** — webhook, fonte crawled, env var, fila message, JSON do DB com forma desconhecida.

**Domain recebe shape já validado e tipado.** Lib pura idem. Re-validar dentro do domain "por garantia" duplica fonte de verdade do schema.

## Por que essa regra

- **Validar 2× é desperdício** (CPU + manutenção do schema em 2 lugares).
- **Domain testa lógica, não parsing.** Mock de input com tipo errado não compila — TS já é a barreira.
- **Schema vive perto da fronteira** onde dados externos chegam — onde ele é necessário, não onde "podia ser bom".

## Exemplos

### ✅ Procedure valida input antes de chamar domain

```ts
const router_apps = router({
  procedure_createApps: publicProcedure
    .input(z.object({
      packageName: z.string().min(1),
      schemaUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      // input já é { packageName: string; schemaUrl: string }
      const result = await domain_createApps({ ctx, input });
      // ...
    }),
});
```

### ✅ Webhook handler valida payload externo

```ts
export async function POST(req: Request) {
  const raw = await req.text();
  const event = stripe_verifyWebhook(raw, signature);  // valida assinatura
  const payload = zStripeEvent.parse(event);            // valida shape
  await domain_handleStripeEventBillings({ ctx, input: payload });
}
```

### ❌ Domain re-validando "por garantia"

```ts
async function domain_createApps({ ctx, input }: DomainInput<{ packageName: string; schemaUrl: string }>) {
  // ❌ procedure já validou; isso é ruído + duplicação de schema
  const validated = z.object({
    packageName: z.string().min(1),
    schemaUrl: z.string().url(),
  }).parse(input);
}
```

### ✅ Lib pura recebe shape, não valida

```ts
// lib/sdk-generator/index.ts
export function generateSdk({ schema, options }: { schema: OpenApiV3; options: GenOpts }): SdkFiles {
  // não chama z.parse — schema chega validado de quem chamou
  // se quem chamou passou shape errado, é bug do caller, não defesa da lib
}
```

## Quando "valida no boundary" cresce

Se procedure tem 6 procedures parecidas todas validando o mesmo `apps` shape:

- Extrai schema pra `src/server/modules/apps/schemas.ts`.
- Cada procedure importa: `.input(zCreateAppsInput)`.
- Schema continua sendo declarado **uma vez**, mas reutilizado.
- Ainda é boundary — só não-duplicado.

## Anti-patterns adicionais

- ❌ Validar input dentro de função domain "por DI / por defesa profunda" — TS + schema no boundary já cobrem.
- ❌ Schema declarado dentro do arquivo de domain — sai pro `schemas.ts` ou `*.types.ts` no módulo (regra dura 7).
- ❌ `z.unknown().parse(...)` pra escapar tipo — não valida nada, falsa segurança. Use `z.object({...})` real ou aceite o tipo upstream.
- ❌ Validar env via `process.env.X || throw` espalhado — centraliza em `src/server/env.ts` com Zod, valida 1× no boot.
