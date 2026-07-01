# Rubrica — SOLID como gatilho concreto (não como folclore)

SOLID é vocabulário fácil de usar como argumento e difícil de usar como gatilho. Esta rubrica converte cada princípio em **gatilho mecânico** — quando aplicar, anti-pattern, exemplo.

## SRP — Single Responsibility (já é regra dura 5)

**Gatilho:** nome do arquivo / função tem "and"/"manager"/"utils"/"helpers" sem prefixo de domínio.

**Aplica:** parte. Um arquivo, uma responsabilidade.

Anti-pattern: `notification-and-billing.ts`, `user-manager.ts`, `helpers.ts`.

## OCP — Open/Closed: extensão sem modificação

**Gatilho:** vou adicionar **provider novo** (registry NPM/GitHub/Custom; storage S3/R2/MinIO; plano novo; método de pagamento novo; canal de notificação novo).

**Aplica:** **arquivo novo** implementando uma porta tipada. Registrador central injeta. **Sem** `switch (provider)` espalhado em ≥ 2 arquivos.

```ts
// ✅ porta + adapters + registry
type RegistryAdapter = {
  publish(tarball: Buffer, opts: PublishOpts): Promise<PublishResult>;
};
const adapters: Record<RegistryKind, RegistryAdapter> = {
  npm:     npmAdapter,
  github:  githubAdapter,
  custom:  customAdapter,
};

// ❌ switch espalhado em 3 arquivos
function publish(kind: RegistryKind, ...) {
  if (kind === "npm") { /* lógica npm */ }
  else if (kind === "github") { /* lógica github */ }
  // ... e idem em outras funções
}
```

## LSP — Liskov Substitution: implementações intercambiáveis

**Gatilho:** tenho **2+ implementações da mesma porta** (RegistryAdapter, StorageAdapter, EmailAdapter).

**Aplica:** todas devolvem o **mesmo shape de resultado classificado**. Adapter A não retorna `null` em conflict enquanto B joga exception.

```ts
// ✅ todas as implementações retornam o mesmo Result discriminado
type PublishResult =
  | { code: "PUBLISHED"; version: string }
  | { code: "CONFLICT"; existingVersion: string }
  | { code: "FAILED"; reason: string };

// ❌ adapter A: retorna null em conflict
async function publishNpm(): Promise<{ version: string } | null> { ... }
// ❌ adapter B: joga exception
async function publishGithub(): Promise<{ version: string }> {
  throw new ConflictError(...);
}
```

## ISP — Interface Segregation: porta mínima

**Gatilho:** função domain recebe `ctx: TRPCContext` inteiro mas só usa `ctx.db` e `ctx.log`.

**Aplica:** declara só o que usa: `ctx: Pick<TRPCContext, "db" | "log">`. Senão teste tem que mockar o universo.

```ts
// ✅ porta mínima
async function domain_createSessionAuth({
  ctx,
  input,
}: {
  ctx: Pick<TRPCContext, "db" | "log">;
  input: { userId: string };
}): Promise<Result<IssuedSession, "USER_NOT_FOUND">> { ... }

// ❌ ctx inteiro, esconde dependência
async function domain_createSessionAuth({ ctx, input }: DomainInput<...>) {
  // só usa ctx.db, mas teste tem que mockar ctx.user, ctx.session, ctx.headers, ...
}
```

## DIP — Dependency Inversion: domain não conhece infra

**Gatilho:** domain function ou lib pura está prestes a importar algo de framework (`TRPCError`, `req.headers`, ORM client direto sem abstração).

**Aplica:** inverte a direção. Domain define a interface; infra implementa. Domain importa só do que está abaixo (lib pura, tipos).

```
✅ direção correta:
  app/   →   server/   →   server/modules/X/   →   domain/X/   →   lib/   →   tipos
  
  Cada camada conhece a de baixo, nunca a de cima.

❌ inversões comuns:
  - domain/X/ importando TRPCError (transport sobe pra domain)
  - lib/Y/ importando do server (lib não é mais publishable)
  - lib/Y/ importando ORM type (acopla a infra)
```

## Resumo — qual perguntar quando

| Sintoma | Princípio | O que faz |
| --- | --- | --- |
| Arquivo crescendo, vai 2+ coisas | SRP | Parte |
| Vou adicionar 4ª variante de algo | OCP | Porta + adapters em vez de switch |
| 2 implementações da mesma coisa retornam shapes diferentes | LSP | Padroniza Result discriminado |
| Função recebe ctx gigante mas usa 2 campos | ISP | Pick / interface mínima |
| Domain quer importar coisa de cima | DIP | Inverte: domain define, infra implementa |
