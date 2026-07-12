# Feature 006 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved e implementado (2026-07-12)
> **Stack inferido:** Next.js 15 App Router + tRPC v11 + Prisma 6 + Zod (`docs/ach.md` § 1) — sem stack nova.
> **Data:** 2026-07-12

## 1. Approach em 3 frases

`readingTimeMinutes` é um campo puramente derivado do `content` já existente — nunca é persistido no banco. É calculado uma única vez, no boundary de output do `post/schema.ts`, via `z.transform()` aplicado no schema base compartilhado por todo output de post (`postEntitySchema` e suas extensões `postEntityWithRelationsSchema`/`postEntityWithTaxonomySchema`). Como `user.readPosts` e todas as rotas de post já reusam esses mesmos schemas de output, o campo aparece em todo endpoint público sem tocar nenhum domain/model.

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Schema (Zod) | `src/server/features/post/schema.ts` | edita | novo helper `calculateReadingTimeMinutes` + `withReadingTime`; `postEntitySchema` (e as extensões que dele derivam) passam a computar `readingTimeMinutes` via `.transform()` |
| Test | `src/server/features/post/procedures/__test__/create.ts` | edita | output de `create` inclui `readingTimeMinutes >= 1` |
| Test | `src/server/features/post/procedures/__test__/readRecent.ts` | edita | posts da listagem incluem `readingTimeMinutes` proporcional ao tamanho do `content` |
| Test | `src/server/features/post/procedures/__test__/readBySlug.ts` | edita | output de `readBySlug` inclui `readingTimeMinutes` |
| Test | `src/server/features/user/procedures/__test__/readPosts.ts` | edita | lista pública de posts de um autor também inclui `readingTimeMinutes` (efeito colateral esperado do schema compartilhado, sem tocar `user/domain`) |

## 3. Modelo de dados (delta)

*(nenhum — `readingTimeMinutes` não é coluna, é campo computado no boundary de output.)*

## 4. Decisões arquiteturais

- **Decisão:** cálculo via `z.transform()` no `postEntitySchema` compartilhado, em vez de calcular em cada `domain/*.ts` que retorna post. **Alternativa rejeitada:** cada domain (`create`, `update`, `readRecent`, `readBySlug`, `read`, `revalidate`) anexa `readingTimeMinutes` manualmente antes de retornar. **Por quê:** todo output de post já converge pro mesmo `postEntitySchema` (ou uma extensão dele) no `.output()` da procedure — calcular ali é um único ponto de verdade, sem duplicar a chamada em 6 arquivos de domain, e sem risco de esquecer um caminho de leitura (o mesmo risco que motivou o grep de reconciliação em `004`/`005`). `postEntitySchema` deixa de ser um `ZodObject` puro e passa a ser um `ZodEffects` (por causa do `.transform()`) — as extensões (`postEntityWithRelationsSchema`/`postEntityWithTaxonomySchema`) não podem mais usar `.extend()` sobre ele (Zod não permite `.extend()` num schema já transformado), então elas passam a estender o schema base **antes** do transform (`postFieldsSchema`) e aplicam o mesmo `withReadingTime(...)` por fora — ver contrato abaixo.
- **Decisão:** velocidade de leitura fixa em 200 palavras/minuto, contagem via `content.trim().split(/\s+/)`. **Alternativa rejeitada:** biblioteca de terceiro (ex.: `reading-time` do npm) ou constante configurável via env/DB. **Por quê:** é uma fórmula de uma linha, sem necessidade de dependência nova (regra da rubrica `when-to-create-lib.md` — nem 150 linhas, nem integração externa); 200 wpm é o valor mais citado como média de leitura adulta (mesma ordem de grandeza do Medium), documentado como premissa em `spec.md` § 5, sem pedido de personalização do dono do produto.
- **Decisão:** mínimo de 1 minuto (`Math.max(1, Math.ceil(wordCount / 200))`), nunca 0. **Alternativa rejeitada:** deixar arredondar pra baixo (post com poucas palavras mostraria "0 min"). **Por quê:** UX — "0 min de leitura" é uma mensagem estranha; qualquer post, por mais curto, leva pelo menos ~1 minuto de atenção.
- **Decisão:** não persistir `readingTimeMinutes` no banco. **Alternativa rejeitada:** coluna `Post.readingTimeMinutes Int` calculada no `domain_createPost`/`domain_updatePost` e salva. **Por quê:** é 100% derivável do `content` já armazenado — persistir criaria uma segunda fonte de verdade que ficaria desatualizada se o post fosse editado sem recalcular; calcular on-the-fly é mais barato que uma migration e elimina essa classe de bug.

## 5. Contratos (boundaries externos)

### Boundary `post.create` / `post.read` / `post.readBySlug` / `post.update` / `post.revalidate` / `post.readRecent` / `user.readPosts` (output ganha campo)

```ts
// output (postEntitySchema, direto ou via extensão) ganha
{ readingTimeMinutes: number } // sempre >= 1
```

Nenhum input muda em nenhuma rota. Único consumidor de cada boundary hoje é o próprio frontend do projeto — nenhuma tela lê o campo novo ainda (zero UI nesta feature), aditivo puro.

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| `postFieldsSchema` (base sem transform) + `postEntitySchema`/`WithRelations`/`WithTaxonomy` construídos por cima com `withReadingTime(...)` | Aplicar `.transform()` direto em `postEntitySchema` e manter `.extend()` nas extensões | Zod não permite `.extend()` num `ZodEffects` (schema já transformado) — precisa manter uma camada pré-transform pra continuar compondo os três schemas de output a partir da mesma base de campos |

## 7. Validação contra invariantes

- [x] Regra 16 (validação no boundary) — o cálculo entra exatamente no `.output()` de cada procedure (via `postEntitySchema`/extensões), o mesmo lugar onde a validação de output já acontecia; nenhum domain/model participa.
- [x] Regra 30 (domain não importa Prisma) — feature não toca nenhum domain/model.
- [x] Não é regra 11 (mudança arquitetural) — usa um recurso já existente do Zod (`.transform()`) dentro de um arquivo já existente (`schema.ts`); nenhuma camada, diretório de 1ª classe ou contrato cross-módulo novo. Não há precedente de `.transform()` no repo até agora, mas é uso padrão da própria lib já adotada (Zod), não uma dependência/padrão novo.
- [x] `[NEEDS CLARIFICATION:]` zerado — spec § 7 vazia.

## 8. Riscos

- **`.transform()` é um padrão novo no repo (nenhum uso anterior).** Mitigação: é API pública estável do Zod (já uma dependência do projeto), não introduz pacote novo; comportamento coberto por teste (`vitest`) confirmando que o output realmente vem transformado via `createCaller`, não só via `.parse()` isolado.
- **Contagem de palavras naive (split por espaço) super/sub-estima se o `content` tiver muito markdown/HTML.** Mitigação: aceito — é uma estimativa, não um valor exato (mesmo comportamento aceito por blogs de referência); documentado em `spec.md` § 5.

## 9. Open questions

*(vazio.)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`).*
