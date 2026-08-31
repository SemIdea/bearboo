# Rubric — SOLID as a concrete trigger (not as folklore)

SOLID is vocabulary that is easy to use as an argument and hard to use as a trigger. This rubric turns each principle into a **mechanical trigger** — when to apply, anti-pattern, example.

## SRP — Single Responsibility (already hard rule 5)

**Trigger:** the file/function name has "and"/"manager"/"utils"/"helpers" without a domain prefix.

**Apply:** split. One file, one responsibility.

Anti-pattern: `notification-and-billing.ts`, `user-manager.ts`, `helpers.ts`.

## OCP — Open/Closed: extension without modification

**Trigger:** I am going to add a **new provider** (NPM/GitHub/Custom registry; S3/R2/MinIO storage; a new plan; a new payment method; a new notification channel).

**Apply:** a **new file** implementing a typed port. A central registrar injects it. **No** `switch (provider)` scattered across ≥ 2 files.

```ts
// ✅ port + adapters + registry
type RegistryAdapter = {
  publish(tarball: Buffer, opts: PublishOpts): Promise<PublishResult>;
};
const adapters: Record<RegistryKind, RegistryAdapter> = {
  npm:     npmAdapter,
  github:  githubAdapter,
  custom:  customAdapter,
};

// ❌ switch scattered across 3 files
function publish(kind: RegistryKind, ...) {
  if (kind === "npm") { /* npm logic */ }
  else if (kind === "github") { /* github logic */ }
  // ... and the same in other functions
}
```

## LSP — Liskov Substitution: interchangeable implementations

**Trigger:** I have **2+ implementations of the same port** (RegistryAdapter, StorageAdapter, EmailAdapter).

**Apply:** all return the **same classified result shape**. Adapter A does not return `null` on conflict while B throws an exception.

```ts
// ✅ all implementations return the same discriminated Result
type PublishResult =
  | { code: "PUBLISHED"; version: string }
  | { code: "CONFLICT"; existingVersion: string }
  | { code: "FAILED"; reason: string };

// ❌ adapter A: returns null on conflict
async function publishNpm(): Promise<{ version: string } | null> { ... }
// ❌ adapter B: throws an exception
async function publishGithub(): Promise<{ version: string }> {
  throw new ConflictError(...);
}
```

## ISP — Interface Segregation: the minimal port

**Trigger:** a domain function receives the whole `ctx: TRPCContext` but only uses `ctx.db` and `ctx.log`.

**Apply:** declare only what you use: `ctx: Pick<TRPCContext, "db" | "log">`. Otherwise the test has to mock the universe.

```ts
// ✅ minimal port
async function domain_createSessionAuth({
  ctx,
  input,
}: {
  ctx: Pick<TRPCContext, "db" | "log">;
  input: { userId: string };
}): Promise<Result<IssuedSession, "USER_NOT_FOUND">> { ... }

// ❌ the whole ctx, hides the dependency
async function domain_createSessionAuth({ ctx, input }: DomainInput<...>) {
  // only uses ctx.db, but the test has to mock ctx.user, ctx.session, ctx.headers, ...
}
```

## DIP — Dependency Inversion: the domain does not know infra

**Trigger:** a domain function or a pure lib is about to import something from a framework (`TRPCError`, `req.headers`, a raw ORM client with no abstraction).

**Apply:** invert the direction. The domain defines the interface; infra implements it. The domain imports only from what is below it (pure lib, types).

```
✅ correct direction:
  app/   →   server/   →   server/modules/X/   →   domain/X/   →   lib/   →   types
  
  Each layer knows the one below, never the one above.

❌ common inversions:
  - domain/X/ importing TRPCError (transport rises into the domain)
  - lib/Y/ importing from the server (the lib is no longer publishable)
  - lib/Y/ importing an ORM type (couples it to infra)
```

## Summary — which to ask when

| Symptom | Principle | What to do |
| --- | --- | --- |
| A file growing, doing 2+ things | SRP | Split |
| I am going to add a 4th variant of something | OCP | Port + adapters instead of a switch |
| 2 implementations of the same thing return different shapes | LSP | Standardize a discriminated Result |
| A function receives a giant ctx but uses 2 fields | ISP | Pick / minimal interface |
| The domain wants to import something from above | DIP | Invert: the domain defines, infra implements |
