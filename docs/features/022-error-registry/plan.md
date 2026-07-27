# Feature 022 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** done
> **Stack inferido:** Next.js 16 / tRPC v11 / TypeScript 5.8 (`docs/ach.md` § 1) — sem stack novo, refactor interno de `src/shared/error/` + `src/server/features/*/domain/*.ts` + boundaries correspondentes.
> **Data:** 2026-07-27

## 1. Approach em 3 frases

Cada arquivo `src/shared/error/<feature>.ts` ganha um catálogo novo via `defineDomainErrors(domain, errors)` namespaced por domínio, agregado num `Errors`/`ErrorCode` central (`src/shared/error/index.ts`) que `DomainError` consulta pra resolver `httpCode`/`message` sozinho. Os 23 arquivos `domain/*.ts` que violam a regra 15 passam a lançar `DomainError("<domain>.<code>")`, e os 24 boundaries ganham o catch genérico com `cause: error` (pra propagar o `code` namespaced sem sobrecarregar `message`). `src/lib/error.ts` simplifica pra exibição direta.

**Revisão pós-descoberta (durante execução, T003-T007):** "cutover completo" (deletar o enum antigo) só é seguro pra catálogos **sem consumidor externo aos 23 domain files** — confirmado por grep sistema-inteiro. `media`/`comment`/`resetToken`/`verifyToken`/`user` não têm consumidor fora do domain+procedure+teste da própria feature → cutover seguro. `auth`/`session`/`post` têm consumidor real fora do escopo (`createRouter.ts` middleware, `caller.ts`, `src/context/trpc/sessionRefreshLink.ts`, `post/[slug]/page.tsx`, `analytics/procedures/recordView.ts`) que compara `error.message` contra o valor cru do enum — **ficam aditivos** (enum antigo intacto + `<Feature>Errors` novo lado a lado). Dois consumidores externos precisam de ajuste pontual porque a origem do erro que eles checam É uma das 23 domain functions migradas: `sessionRefreshLink.ts` (client-side, via `errorFormatter` → `data.domainCode`, novo campo, não confundir com `data.code` nativo do tRPC que já é o HTTP code) e `post/[slug]/page.tsx` (server-side via `createCaller()`, in-process — lê `error.cause` direto, sem precisar do `errorFormatter`). Os demais checks nesses 2 arquivos (`SESSION_EXPIRED`, `USER_NOT_VERIFIED` — originam do middleware do `createRouter.ts`, não migrado) ficam inalterados.

## 2. Componentes afetados

### Fundação (Shared error)

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Shared error | `src/shared/error/registry.ts` | novo | `defineDomainErrors` + `Set` de validação de domínio duplicado (ADR-0017) |
| Shared error | `src/shared/error/index.ts` | novo | agrega os 7 catálogos migrados (+ `media` já existente) num `Errors`, deriva `ErrorCode = keyof typeof Errors` |
| Shared error | `src/shared/error/domainError.ts` | edita | `DomainError` passa a receber só `code: ErrorCode` e resolver `httpCode`/`message` sozinho |
| Shared error | `src/shared/error/{comment,resetToken,verifyToken,user}.ts` (4 arquivos, + `media` já feito) | edita (substitui) | cutover — sem consumidor externo aos 23 domain files |
| Shared error | `src/shared/error/{auth,session,post}.ts` (3 arquivos) | edita (aditivo) | `<Feature>ErrorCode`/`<Feature>ErrorMessages` antigo FICA; `<Feature>Errors` novo entra ao lado — têm consumidor externo real (ver revisão acima) |
| Procedure boundary | `src/server/createRouter.ts` | edita | `errorFormatter` ganha `data.domainCode` quando `error.cause instanceof DomainError` |
| Procedure boundary | `src/context/trpc/sessionRefreshLink.ts` | edita | check de `INVALID_TOKEN` (única origem migrada) passa a usar `data.domainCode`; demais checks inalterados |
| Server Component | `src/app/(half)/post/[slug]/page.tsx` (3 call-sites) | edita | check de `POST_NOT_FOUND` passa a usar `error.cause instanceof DomainError` (in-process, sem precisar do `errorFormatter`) |
| Lib (frontend) | `src/lib/error.ts` | edita | `getErrorMessage` simplifica — `error.message` já é texto final, sem lookup |

### Migração por feature (domain + boundary, mesmo commit por grupo)

| Feature | Catálogo | Domain files (codes) | Boundary files (catch genérico) |
| --- | --- | --- | --- |
| auth/session | `auth.ts` (1 code), `session.ts` (4 codes) | `user/domain/login.ts`, `auth/domain/{createAuthSession,deleteSession,readSessionByRefreshToken,readUserAndSessionByAccessToken,refreshSession}.ts` | `user/procedures/login.ts`, `auth/procedures/{logoutUserFromSession,refreshSession}.ts`, `src/server/createContext.ts` |
| reset/verify token | `resetToken.ts` (3 codes), `verifyToken.ts` (3 codes) | `auth/domain/{resetPassword,verifyToken}.ts` | `auth/procedures/{resetPassword,verifyToken}.ts` |
| user | `user.ts` (2 codes) | `user/domain/{getUserByEmailOrThrow,getUserOrThrow,register}.ts` | `user/procedures/register.ts`, `auth/procedures/resendVerificationEmail.ts` (via `reCreateToken.ts`), `user/procedures/{readProfile,readComments,updateRole,readPosts}.ts` (via `getUserOrThrow`) |
| comment | `comment.ts` (3 codes) | `comment/domain/{delete,update}.ts` | `comment/procedures/{delete,update}.ts` |
| post | `post.ts` (4 codes) | `post/domain/{archive,delete,publish,readBySlug,readReviewComments,read,reject,revalidate,submitForReview,update}.ts` (10 arquivos) | `post/procedures/{archive,delete,publish,readBySlug,readReviewComments,read,reject,revalidate,submitForReview,update}.ts` (10 arquivos) |

### Já migrado (referência, não retocado)

`media.ts`, `media/domain/delete.ts`, `media/procedures/delete.ts` — já usam `DomainError`/`defineDomainErrors` desde `ADR-0015`/`021-media-upload`; só precisam continuar compilando após `domainError.ts`/`index.ts` mudarem de forma (call-site `new DomainError(MediaErrorCode.X)` → `new DomainError("media.x")`, 1 arquivo).

### Testes (regra dura 1)

- Novo: `src/shared/error/__test__/registry.ts` (duplicate-domain guard, key remap), `src/shared/error/__test__/domainError.ts` (resolve `httpCode`/`message` por `code`).
- Edita: `src/lib/__test__/backendSupport.ts` (teste de `getErrorMessage` muda de assinatura/expectativa), `src/server/features/media/domain/__test__/delete.ts` (`code` namespaced).
- Cada grupo de migração por feature (tabela acima) atualiza/adiciona teste nos `controller.test.ts`/`__test__/` correspondentes cobrindo pelo menos 1 caminho de erro por domain function tocada — a maioria já tem teste do caminho de erro (`TRPCError` sendo lançado); o teste passa a asserir `DomainError`/o catch no boundary em vez do throw cru.

## 3. Modelo de dados (delta)

Sem delta — nenhuma entidade Prisma tocada.

## 4. Decisões arquiteturais

- **Decisão:** representar erro de domínio como string namespaced resolvida por `ErrorRegistry`, `DomainError` como classe única, `TRPCError.message` = texto humano. Já decidido em `ADR-0017` — este plan só referencia.
- **Decisão (gate `/afm:deliver`, 2026-07-27):** cutover completo dos 23 arquivos `domain/*.ts` que violam a regra dura 15, em vez de manter os catálogos antigos como shim permanente + resolver dual-mode no frontend. **Alternativa rejeitada:** resolver dual-mode em `getErrorMessage` decidindo por `httpCode` — evitaria tocar os 23 arquivos agora, mas manteria a regra 15 violada indefinidamente e adiciona complexidade permanente no frontend só pra coexistir com uma dívida que `afm.md` § 3.1 já queria fechada. **Por quê o cutover:** `afm.md` § 3.1 já registra que a regra 15 exige "migração coordenada, não boy-scout arquivo-a-arquivo" — o inventário completo (23 arquivos, 7 catálogos, 24 boundaries) já foi levantado nesta rodada de discovery, então adiar não economiza trabalho de levantamento, só empurra a migração de código.
- **Decisão:** migração agrupada por feature (auth/session, tokens, user, comment, post — tabela § 2), não por arquivo individual nem tudo em um commit só. **Alternativa rejeitada:** 23 tasks de 1 arquivo cada — overhead de commit/task desproporcional ao tamanho de cada mudança (cada domain file tem 1-3 throw sites). **Alternativa rejeitada:** 1 task gigante pra tudo — dificulta revisão e checkpoint de halt/retry por task (Phase 3 do `deliver`).

## 5. Contratos (boundaries externos)

Sem boundary externo novo. Formato de resposta de erro do tRPC (JSON-RPC 2.0, `TRPCError`) não muda de shape — só passa a ter `message` sempre como texto final em 100% dos caminhos de erro de domínio (hoje só ~1/42 procedures).

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Migração coordenada de 23 arquivos + 24 boundaries num único delivery, em vez de infra-only | Só a infraestrutura (registry/index/domainError), deixando a violação da regra 15 pra depois | `afm.md` § 3.1 já proibia boy-scout pra essa regra especificamente; o dual-mode necessário pra conviver com a violação por mais tempo era complexidade permanente pra evitar complexidade temporária de migração — decisão do gate (§ 4) |

## 7. Validação contra invariantes

- [x] Regra 1 (teste por código novo) — cada grupo de migração atualiza teste correspondente; `registry.ts`/`domainError.ts` ganham teste novo.
- [ ] Regra 4 (type-check limpo) — `tsc --noEmit` ao fim de cada task.
- [x] Regra 5 (uma responsabilidade por arquivo) — `registry.ts` só registra; cada `<feature>.ts` continua só catálogo do próprio domínio.
- [x] Regra 6 (arquivo ≤300 linhas) — maior arquivo tocado é `post.ts` (crescendo de 21 linhas pra ~30-40 com 4 codes namespaced); folga grande.
- [x] Regra 7 (domain exporta 1 função) — nenhuma das 23 migrações adiciona/remove export; só troca o `throw`.
- [x] Regra 10 (sem shim morto) — cutover completo, sem catálogo antigo sobrando sem caller.
- [x] Regra 11 (mudança arquitetural pára e pergunta) — desenho geral validado em várias rodadas + ADR-0017; expansão de escopo confirmada explicitamente no gate (`spec.md` § 7, sessão 2026-07-27).
- **N/A** Regra 13 (segredo).
- [ ] Regra 15 (Domain ≠ Transport) — **esta feature fecha a violação.** `grep -rl "TRPCError" src/server/features/*/domain/*.ts` deve retornar vazio ao final (hoje: 23 arquivos). `afm.md` § 3 regra 15 e § 3.1 (tabela forward-only) atualizam na Reconciliação (T008).
- **N/A** Regra 16 (validação no boundary) — não mexe em schema Zod.
- `[NEEDS CLARIFICATION:]` zerado em spec e plan.

## 8. Riscos

- **Risco:** call-graph mal mapeado faz uma migração perder um boundary (ex: erro de domínio sobe sem catch, vira `INTERNAL_SERVER_ERROR` genérico em vez do `httpCode` correto). **Mitigação:** inventário completo levantado via `Agent(Explore)` com citação file:line pra cada um dos 23 domain files + seus callers diretos (ver tabela § 2); teste de cada grupo cobre o caminho de erro explicitamente.
- **Risco:** `domain_getUserOrThrow`/`domain_getUserByEmailOrThrow` são chamados por OUTRAS domain functions (não só as 23 da lista original), então o catch precisa estar na procedure de origem da cadeia inteira, não no meio. **Mitigação:** tabela § 2 já rastreia a cadeia completa (ex: `reCreateToken.ts` → `resendVerificationEmail.ts`; `getUserOrThrow` ↔ 7 procedures diferentes via 4 domain functions intermediárias não-listadas originalmente).
- **Risco baixo:** `createContext.ts` já tem try/catch funcional pro `readUserAndSessionByAccessToken` — só precisa trocar `error instanceof TRPCError && error.code === "UNAUTHORIZED"` por `error instanceof DomainError && error.httpCode === "UNAUTHORIZED"`, não reescrever a lógica.

## 9. Open questions

Nenhuma — resolvidas no gate (`spec.md` § 7, sessão 2026-07-27).

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`). Plan NÃO escolhe stack — lê de `ach.md`.*
