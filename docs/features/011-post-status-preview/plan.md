# Feature 011 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** approved (gate 2026-07-12, "Executa os 2 até o fim")

## 1. Resumo técnico

Dois fios independentes que compõem a mesma UX (autor controla e vê o próprio post antes de ele ficar público):

1. **Seletor de status** — puro frontend. `status` já é aceito por `createPostSchema`/`updatePostSchema` e já é uma coluna real (`docs/features/004-post-status/`); só falta o campo na UI.
2. **Preview via URL real** — `domain_readPostBySlug` passa a permitir que o dono do post veja o próprio post independente do status, usando `ctx.user` (já disponível opcionalmente em `publicProcedure`, sem sessão obrigatória). Não cria rota nova nem tipo de procedure novo.

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `src/app/(half)/post/create/page.client.tsx` | `<select>` nativo de `status` no form (Draft/Published/Archived); `defaultValues={{ status: "PUBLISHED" }}` no `FormBase` pra manter o `<select>` controlado desde o início |
| `src/app/(half)/post/edit/[id]/page.client.tsx` | idem, valor inicial = status atual do post (já vem do `defaultValues={{ ...post }}` existente) |
| `src/server/features/post/domain/readBySlug.ts` | `isOwner = post.userId === input.callerId`; 404 só quando `!post \|\| (post.status !== "PUBLISHED" && !isOwner)` |
| `src/server/features/post/procedures/readBySlug.ts` | passa `callerId: ctx.user?.id` no input do domain (mesmo padrão de `update`/`delete`, que já passam `userId` — mantém `ctx` do domain como `IBaseContextDTO`, sem `user`) |
| `src/server/caller.ts` | novo `createOptionalDynamicCaller()` — lê cookies como `createDynamicCaller`, mas **sem** o redirect forçado se não houver sessão (precisa continuar público pra visitante anônimo) |
| `src/app/(half)/post/[slug]/page.tsx` | ver § 4 "Achado durante implementação" — restructurado em `PostContent` (cacheado, caminho público) → fallback `OwnerPreview` (dinâmico, só quando o cacheado não acha nada) → `PostView` (JSX compartilhado, com banner condicional quando `post.status !== "PUBLISHED"`) |

## 3. Fora de escopo

Ver `spec.md` § 4.

## 4. Decisões arquiteturais

- **Owner-preview via `ctx.user` em `publicProcedure`, não uma procedure `protected` separada:** o comportamento precisa continuar público (visitante sem sessão ainda deve poder ler posts `PUBLISHED`), só adiciona uma exceção condicional pro dono. Trocar pra `protectedProcedure` quebraria leitura anônima. `ctx.user` já é opcional no contexto de `publicProcedure` (`src/server/createRouter.ts` linhas 25-29) — dado já disponível, zero boundary novo.
- **Sem rota `/post/[slug]/preview` dedicada:** a spec pede ver "como vai ficar" na URL real — criar uma rota de preview separada duplicaria a página inteira (layout, related posts, comentários) só pra checar status. Reutilizar a própria página com um banner é mais simples e testa o comportamento real de produção.
- **`<select>` nativo, não um componente `Select` novo:** o repo não usa nenhum componente de select (nem shadcn `Select`, nem `DropdownMenu` pra esse fim) — `<select>` HTML puro é consistente com o padrão atual de `InputField`/input nativo e evita introduzir uma dependência de UI só pra 2 campos.
- **Sem mudança em `readPostBySlugOutputSchema`:** o post retornado já tem `status` no output (`docs/features/004-post-status/`); o frontend decide o banner a partir do campo que já existe.

## 5. Contratos

`post.readBySlug` (público) passa a poder retornar um post não-`PUBLISHED`, mas **só** quando o chamador autenticado é o dono — mudança aditiva e escopada por identidade, não um relaxamento geral do filtro. Consumidores existentes (visitante, outro usuário) veem exatamente o mesmo 404 de antes.

## 6. Riscos

- Se o `ctx.user` estiver desatualizado (sessão trocada de dono sem refresh de página), o preview poderia mostrar/esconder incorretamente por um request — mesma característica de staleness que já existe em qualquer leitura de sessão no app hoje, não é regressão introduzida por esta feature.

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): novo teste em `procedures/__test__/readBySlug.ts` cobrindo dono vê rascunho / não-dono recebe 404 / visitante anônimo recebe 404.
- Regra 4 (`tsc --noEmit` limpo): checar após a mudança.
- Regra 15 (Domain ≠ Transport): `readBySlug.ts` já lança `TRPCError` hoje (um dos 17 arquivos na violação forward-only conhecida, `afm.md § 3.1`) — a mudança não piora nem corrige essa violação pré-existente, só adiciona a condição `isOwner` à guarda existente.
- Regra 11: sem camada/componente novo, sem contrato cross-módulo novo — não aciona o gatilho.

## 8. Dependências

Nenhuma.

## 9. Achado durante implementação (2026-07-12) — plano original incompleto

A leitura inicial da § 4 assumiu que `domain_readPostBySlug` receber `ctx.user` seria suficiente pro preview funcionar na página real. **Não era.** `PostContent` (`src/app/(half)/post/[slug]/page.tsx`) é `"use cache"` e busca via `createCaller()` (`src/server/caller.ts`), que monta o contexto com `headers: new Headers()` **sempre vazio, sem cookies**. Ou seja: no caminho cacheado, `ctx.user` é sempre `undefined`, não importa quem esteja logado — o dono nunca seria reconhecido como dono na página de verdade, só nos testes de procedure isolados. E não dá pra simplesmente ler `cookies()` dentro de `PostContent`, porque Cache Components proíbe leitura dinâmica dentro de escopo `"use cache"` (mesma família de restrição já documentada em `docs/gotchas.md` a partir de `009-post-404-status`).

**3 opções levantadas e apresentadas ao dono (gate desta sessão, 2026-07-12):**
- (A) fallback dinâmico aninhado — mantém `PostContent` cacheado pro caminho público; só quando esse lookup não acha nada, um componente novo (`OwnerPreview`), não-cacheado, dentro do próprio `<Suspense>`, tenta de novo com um caller que lê cookies (`createOptionalDynamicCaller`, novo, sem o redirect forçado de `createDynamicCaller`).
- (B) remover `"use cache"`/`cacheLife` da página inteira — mais simples, mas perde o cache de horas pro caso comum (posts publicados).
- (C) rota de preview separada — não toca a página cacheada, mas quebra a promessa da spec de "ver na URL real".

**Decisão do dono: Opção A.** Implementada: `PostContent` tenta o caminho cacheado (`createCaller()`, sem cookies) primeiro; só no `catch` de `POST_NOT_FOUND` renderiza `<Suspense><OwnerPreview slug /></Suspense>`, que usa `createOptionalDynamicCaller()` (lê cookies, não redireciona se anônimo) pra tentar de novo como o dono. Se também não achar, chama `notFound()` normalmente. `PostView` (JSX extraído) é compartilhado entre os dois caminhos. Cache de horas preservado pro caso comum; custo dinâmico só paga no caso raro (dono vendo rascunho/arquivado). Validado com `next build --debug-prerender`: sem erro novo em `/post/[slug]` (só o baseline conhecido de `/`).

**Limitação aceita (cosmética, fora do critério de sucesso da spec):** `generateMetadata` continua usando `createCaller()` (sem cookies) — a aba do navegador mostra "Post Not Found" como título enquanto o dono vê o preview de um rascunho. Não é regressão (mesmo comportamento de antes pra qualquer post não-`PUBLISHED`) e não afeta o critério de sucesso (conteúdo visível), só o `<title>` da aba.
