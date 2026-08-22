# Research — Error handlers: como funcionam, o que é um bom error handler, quais padrões seguir

> **Data:** 2026-07-26
> **Disparado por:** investigação livre do user: "gostaria de melhorar o sistema de erro, mas não sei muito bem como fazer um error handler — para o que serve, o que seria bom, quais padrões devemos seguir"
> **Status:** applied — decisão final incorporada em [ADR-0017](../adr/0017-error-registry-domain-error-namespaced.md) (substitui [ADR-0016](../adr/0016-centralizar-mapeamento-domain-error-trpcerror.md))

## Pra que serve um "error handler", em uma frase

Um error handler não é uma função só — é a **decisão, em cada camada do sistema, de quem trata o quê e como isso vira uma resposta útil**: pro código que chamou (trata e segue), pro usuário (mensagem clara, sem detalhe interno), e pra você-no-futuro debugando (log com contexto suficiente pra reconstruir o que aconteceu, sem vazar segredo nenhum). "Bom" error handling é a garantia de que um erro nunca é: (a) engolido em silêncio, (b) mostrado cru pro usuário (stack trace, mensagem de banco), ou (c) perdido sem rastro nos logs.

---

## Estado atual do projeto (auditoria de código)

O bearboo **já tem a arquitetura certa desenhada** em `docs/rubrics/error-classification.md` — 3 camadas (Domain → Procedure → Infra), erro de domínio com `code` literal, boundary tRPC traduz pra `TRPCError`. \ está só **parcialmente implementado**:

**Funciona bem:**
- `src/shared/error/domainError.ts` — `DomainError<C extends string>` limpa e bem tipada.
- 9 arquivos de código de erro por feature (`auth.ts`, `user.ts`, `post.ts`, `comment.ts`, `media.ts`, `session.ts`, `resetToken.ts`, `verifyToken.ts`, `validation.ts`) — padrão `enum` + mensagens consistente.
- `src/lib/error.ts` (`getErrorMessage`) — lookup centralizado de mensagem pro frontend; usado de forma consistente em componentes (ex.: `src/components/createComment.tsx:40-42`).
- `src/server/createRouter.ts:15-27` — `errorFormatter` já existe e trata `ZodError` sem vazar stack.
- `src/server/features/media/procedures/delete.ts:12-38` — **o único procedure que faz o catch-and-map certo** (`catch (error) { if (error instanceof DomainError) {...} }`).

**Inconsistente / parcial:**
- **Regra dura 15 (Domain ≠ Transport) violada em ~23-24 arquivos de `domain/`** — funções domain lançam `TRPCError` direto em vez de `DomainError`/`Result`, furando a camada. Já documentado como dívida técnica *forward-only* em `docs/afm.md` § 3.1 (aplica só a código novo daqui pra frente, não retroage). Exemplos: `src/server/features/auth/domain/resetPassword.ts:16-27`, `src/server/features/post/domain/delete.ts:15-31`, `src/server/features/comment/domain/delete.ts:13-24`.
- Só 1 de ~42 procedures faz o catch-and-map descrito na rubrica; os outros ou repassam o `TRPCError` que o domain já lançou (funciona por acidente, não por desenho) ou não tratam nada.
- Não existe `mapDomainErrorToTRPCError()` centralizado — o único exemplo correto resolve isso com if/switch manual local.

**Faltando:**
- **Nenhum catch de erro de Infra na borda.** `createRouter.ts` só trata `ZodError`; se um erro de banco/rede não-tratado subir, ele **vaza pro cliente sem máscara**.
- **Sem logging estruturado.** Só 2 `console.error` no projeto inteiro (`src/server/caller.ts:42`, `src/server/features/user/procedures/register.ts:40`). Nenhum Sentry/Pino/Winston/correlation ID.
- `src/app/error.tsx:5-26` existe mas é **mínimo** — só "Try again", sem reportar o erro a lugar nenhum, sem `global-error.tsx` cobrindo falha no root layout.
- Frontend não distingue Domain error (code conhecido) de Infra error (500/timeout) — tudo cai no mesmo `getErrorMessage()` com fallback genérico.

---

## Classificação de erros — domain vs. transport vs. infra é um padrão reconhecido

**Decision (proposta):** manter o modelo de 3 categorias já documentado em `docs/rubrics/error-classification.md`, representando erro de domínio como **union discriminada** (`Result<T,E>` com `code` literal `as const`) — não como hierarquia de `class X extends Error`.

**Rationale:**
- É uma variante de **Railway Oriented Programming** (Scott Wlaschin) — tratar erro como valor no tipo de retorno (`Result<T,E>`/`Either`) força tratamento explícito no compilador, em vez de exceção que escapa silenciosamente por um `await` esquecido.
- `Zod` já usa exatamente esse padrão nativamente: `.safeParse()` retorna `{success:true,data} | {success:false,error}` — uma union discriminada, não um throw.
- TypeScript's discriminated unions dão narrowing automático: um `switch` exaustivo no `code` quebra em *compile time* se um novo code for adicionado e esquecido em algum caller — é o mecanismo que a rubrica do projeto já cita ("code literal `as const` garante cobertura no caller").
- Next.js recomenda a mesma distinção pra Server Actions: erro **esperado** (domain) → retorna objeto estruturado; erro **inesperado** (infra) → `throw`.

**Alternativas consideradas:**
- **Hierarquia de `class XError extends Error`** — rejeitada: não compõe bem em pipelines async, `instanceof` é fácil de esquecer em algum branch, e stack trace da exceção tende a vazar detalhe interno se alguém logar `error.message` direto pro cliente.
- **String de erro genérica sem `code`** — rejeitada: sem discriminante, impossível fazer switch exaustivo; qualquer novo caso de erro é silenciosamente ignorado pelo caller.

**Sources:**
- https://fsharpforfunandprofit.com/posts/railway-oriented-programming-carbonated/
- https://zod.dev
- https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations

---

## tRPC — error handling centralizado

**Decision (proposta):** consolidar o mapeamento Domain→`TRPCError` em UM helper (`mapDomainErrorToTRPCError`, ou o `errorFormatter` do `initTRPC`), em vez de se repetir se a rubrica for seguida procedure por procedure. Usar `error.cause` pra carregar dado estruturado (ex.: qual campo falhou) sem colocar isso na `message`.

**Rationale:**
- A doc oficial do tRPC v11 mostra exatamente esse padrão: `errorFormatter({error, shape}) => {...}` recebe o erro, pode inspecionar `error.cause`/`error instanceof ZodError`, e customizar a resposta — o `shape` default já esconde stack trace em produção.
- `error.cause` existe pra isso: carregar contexto estruturado (ex. `zodError.flatten()`) sem contaminar a `message` (que é o que aparece pro usuário).
- tRPC segue envelope JSON-RPC 2.0 — `code`, `message`, `data` sempre presentes, então o cliente pode confiar no formato sem parsing frágil.
- **Aplicação direta no bearboo:** o `errorFormatter` de `createRouter.ts:15-27` já existe e já trata `ZodError` — é o lugar natural pra também centralizar o `DomainError → TRPCError`, substituindo os N ifs espalhados (hoje só 1 procedure faz isso manualmente).

**Alternativas consideradas:**
- **Cada procedure mapeando erro no próprio corpo** — é o estado atual do projeto; rejeitada como alvo porque é exatamente a inconsistência que a auditoria encontrou (41 de 42 procedures não fazem o mapeamento, então ou repassam `TRPCError` cru do domain — o que só "funciona" porque o domain já furou a camada — ou deixam passar sem tratar).

**Sources:**
- https://trpc.io/docs/v11/server/error-formatting

---

## Next.js App Router — error boundaries e proteção de stack trace

**Decision (proposta):** manter `error.tsx` por segmento + adicionar/robustecer `global-error.tsx` na raiz; usar `error.digest` como correlation ID pro log do servidor, nunca a `message` crua.

**Rationale:**
- Doc oficial do Next.js é explícita: em produção, o `Error` repassado ao client component do `error.tsx` tem a mensagem **reduzida a um identificador genérico** — o texto completo só aparece em dev, justamente pra não vazar detalhe sensível.
- `error.digest` é gerado automaticamente pelo Next.js e serve pra correlacionar o erro que o usuário viu com a entrada correspondente no log do servidor, sem expor o conteúdo do erro no cliente.
- `error.tsx` não cobre falha no próprio `layout.tsx` do mesmo segmento — só `global-error.tsx` na raiz cobre isso. **Aplicação direta:** `src/app/error.tsx` existe mas está minimal (só "Try again"); não há indicação de `global-error.tsx` — é um gap real se o root layout falhar.

**Alternativas consideradas:**
- **Confiar só no error handling do tRPC** — rejeitada: falhas de Server Component durante SSR (ex. um `await` que quebra fora de uma procedure tRPC) escapam completamente da camada tRPC; só o error boundary do Next.js pega isso.

**Sources:**
- https://nextjs.org/docs/app/api-reference/file-conventions/error
- https://nextjs.org/docs/app/building-your-application/routing/error-handling

---

## Observability / logging estruturado

**Decision (proposta):** logging estruturado com correlation ID (gerado na entrada da request, propagado via `error.cause`/header, usado em todo log subsequente) + serviço externo (ex. Sentry) só para erro de Infra não-tratado — não para Domain error esperado.

**Rationale:**
- Nem tRPC nem Next.js dão um correlation ID pronto — é responsabilidade do projeto gerar um (UUID por request) e propagar.
- Ferramentas como Sentry agrupam por fingerprint automaticamente, e permitem um hook (`beforeSend`) pra excluir erros esperados (Domain) da telemetria — evita poluir a quota/dashboard com "usuário não encontrado", que não é bug.
- **Aplicação direta no bearboo:** hoje só 2 `console.error` no projeto inteiro, sem correlation ID nenhum — se um erro de Infra acontecer em produção agora, não tem como reconstruir o que causou sem acesso direto ao ambiente.

**Alternativas consideradas:**
- **Sem correlation ID, só log solto** — é o estado atual; rejeitado como alvo porque impossibilita conectar log de cliente → servidor → banco na hora de investigar um incidente real.
- **Logar Domain errors no Sentry também** — rejeitada: são esperados/funcionais, não bugs; loga ruído e queima quota.

**Sources:**
- https://docs.sentry.io/product/error-monitoring/

---

## RFC 9457 (Problem Details) — relevante mas não crítico pra tRPC

**Decision (proposta):** não adotar RFC 9457 (ex-7807) como formato de resposta — o envelope JSON-RPC 2.0 nativo do tRPC (`code`/`message`/`data`) já cumpre o mesmo objetivo (estrutura previsível de erro). Só valeria a pena se a mesma API também servisse clientes REST externos.

**Rationale:**
- RFC 9457 define `{type, title, detail, status, instance}` — um padrão agnóstico de protocolo pra erro HTTP. Útil quando o consumidor da API não é tRPC (mobile legado, integrador terceiro).
- Como o bearboo é tRPC-only (não expõe REST pra terceiros hoje), adicionar uma camada de adaptação RFC 9457 seria complexidade sem consumidor real — vai contra "não inventar abstração sem demanda".

**Alternativas consideradas:**
- **Adotar RFC 9457 puro** — rejeitada por falta de demanda concreta (nenhum client REST/externo hoje).

**Sources:**
- https://www.rfc-editor.org/rfc/rfc9457 (obsoleta RFC 7807)
- https://trpc.io/docs/v11/server/error-formatting

---

## Recomendação sintética pra este projeto

Ordenado por impacto/esforço, não é um plano de tasks — é insumo pra você decidir o próximo passo:

1. **Centralizar Domain→TRPCError no `errorFormatter` de `createRouter.ts`** (ou um helper único chamado por todo procedure) — resolve a maior inconsistência encontrada (41/42 procedures sem mapeamento próprio) sem precisar tocar nos ~23 domains que já furam a regra.
2. **Catch de Infra na borda** — qualquer erro que não seja `DomainError` nem `ZodError` no `errorFormatter` deveria virar `INTERNAL_SERVER_ERROR` genérico pro cliente + log completo no servidor. Hoje isso vaza sem máscara.
3. **Logging estruturado mínimo com correlation ID** — nem precisa Sentry no primeiro passo; um `console.error({ correlationId, error, path })` consistente em todo catch de Infra já destrava investigação de incidente.
4. **Consertar a violação da regra dura 15** (~23-24 arquivos domain lançando `TRPCError`) — já é dívida técnica reconhecida e *forward-only* em `docs/afm.md` § 3.1; não precisa virar mutirão, mas cada domain tocado por boy-scout rule deveria migrar pro padrão `Result`/`DomainError`.
5. **`global-error.tsx` na raiz** — cobre o caso (raro, mas real) de falha no próprio root layout, que `src/app/error.tsx` não cobre.

Os itens 1 e 4 são decisão arquitetural (mudam o contrato entre domain/procedure) — se decidir seguir, vale materializar como ADR antes de tocar código (`/afm:adr`), já que redefine formalmente como as camadas se falam.

---

## Decisão final (2026-07-26, iterada em conversa)

O item 1 (centralizar Domain→TRPCError) evoluiu, através de várias rodadas de design colaborativo, pra um desenho mais específico e mais forte do que a recomendação original acima: em vez de `DomainError<C>` genérico + mapa de httpCode separado, o `code` do domínio passou a ser uma **string namespaced** (`"auth.invalid_credentials"`), montada automaticamente por um `ErrorRegistry` (`defineDomainErrors(domain, errors)` por feature + agregador central), com `DomainError` resolvendo `httpCode`/`message` sozinho a partir do `code`. Isso elimina switch/if-chain em toda procedure, mantém a granularidade que o frontend (`getErrorMessage`) já depende, e preserva checagem de typo em compile-time via `keyof typeof Errors`.

Desenho completo, alternativas rejeitadas (hierarquia de classes, `Result<T,E>`, parsing de string em runtime sem registry, `code` = HTTP status puro) e consequências: **[ADR-0017](../adr/0017-error-registry-domain-error-namespaced.md)**, que substitui o ADR-0016 originalmente ligado a este research.
