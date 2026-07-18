# Feature 018 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved
> **Stack inferido:** Next.js 15 (App Router) / tRPC v11 / Prisma 6 / Zod — lido de `docs/ach.md`, sem reabrir discussão.
> **Data:** 2026-07-18

## 1. Approach em 3 frases

Adiciona 4 campos no `Post` (`previousSlug`, `seoTitle`, `seoDescription`, `canonicalUrl`, todos nullable, 1 migration) e estende `updatePostSchema`/`domain_updatePost` pra aceitar edição de `slug` (com resolução de colisão) e dos 3 campos de override. `generateMetadata`/`PostContent` em `post/[slug]/page.tsx` passam a preferir os campos de override quando presentes e, no caminho de "slug não encontrado", consultam um novo `post.readRedirectSlug` (via `previousSlug`) antes de cair no fluxo atual de not-found/preview do dono — se encontrar, faz `permanentRedirect` pro slug atual. O algoritmo de sufixo de colisão de slug (hoje inline em `domain_createPost`) é extraído pra `domain_resolveAvailableSlug` (`domain/resolveAvailableSlug.ts`) e reusado por `domain_updatePost`, mantendo a regra dura 7 (1 export por arquivo de domain).

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| Model | `prisma/schema.prisma` (`Post`) | edita | 4 campos novos: `previousSlug`, `seoTitle`, `seoDescription`, `canonicalUrl` |
| Model | `src/server/models/post.ts` | edita | `IPostEntity` ganha os 4 campos; novo método `readByPreviousSlug(slug)` |
| Domain-like | `src/server/features/post/domain/resolveAvailableSlug.ts` | novo | extrai o algoritmo de sufixo de `create.ts`, reusado por `create` e `update` |
| Domain-like | `src/server/features/post/domain/create.ts` | edita | passa a importar `domain_resolveAvailableSlug` em vez da função local |
| Domain-like | `src/server/features/post/domain/update.ts` | edita | aceita `slug` opcional: se mudou, resolve colisão + grava `previousSlug`; passa `seoTitle`/`seoDescription`/`canonicalUrl` pro repository |
| Domain-like | `src/server/features/post/domain/readRedirectSlug.ts` | novo | dado um slug, resolve pro slug atual via `previousSlug` (ou `null`) |
| Procedure | `src/server/features/post/procedures/readRedirectSlug.ts` | novo | expõe `domain_readRedirectSlug`, público (mesmo nível de `readBySlug`) |
| Procedure | `src/server/features/post/procedures/update.ts` | — | sem mudança de código — já faz spread do `input`, herda os campos novos do schema |
| Procedure-like (router) | `src/server/features/post/index.ts` | edita | registra `readRedirectSlug` |
| Boundary (Zod) | `src/server/features/post/schema.ts` | edita | `updatePostSchema` ganha `slug`/`seoTitle`/`seoDescription`/`canonicalUrl` opcionais; `postFieldsSchema` ganha `seoTitle`/`seoDescription`/`canonicalUrl` (saída, pra `generateMetadata` e form de edição lerem); novo `readRedirectSlugSchema`/`readRedirectSlugOutputSchema` |
| App Router special file | `src/app/(half)/post/[slug]/page.tsx` | edita | `generateMetadata` prefere override; `PostContent` consulta `readRedirectSlug` no catch de NOT_FOUND antes de cair pro `OwnerPreview`, e faz `permanentRedirect` se achar |
| Frontend form | `src/app/(half)/post/edit/[id]/page.client.tsx` | edita | `InputField` novos: `slug`, `seoTitle`, `seoDescription`, `canonicalUrl` |

## 3. Modelo de dados (delta)

```
Post (edita, 4 colunas novas — 1 migration)
  previousSlug     String?  @unique   // slug imediatamente anterior; null se nunca editado
  seoTitle         String?
  seoDescription   String?
  canonicalUrl     String?
```

`previousSlug` é `@unique` pelo mesmo motivo de `slug`: dois posts não podem reivindicar o mesmo slug antigo (evita redirect ambíguo). Ao editar o slug de um post que já tinha um `previousSlug` de uma edição anterior, o `previousSlug` antigo é sobrescrito pelo slug que acabou de deixar de ser o atual (só 1 nível de histórico — ver spec § 4 Out of scope).

## 4. Decisões arquiteturais

- **Decisão:** `previousSlug` é 1 coluna nullable no próprio `Post`, não uma tabela `PostSlugHistory`. **Alternativa rejeitada:** tabela de histórico completo (N slugs por post). **Por quê:** a spec cobre só "corrigi um slug uma vez", não reescritas repetidas; tabela nova seria o primeiro caso de "componente de 1ª classe" só pra um redirect de 1 nível — YAGNI, mesmo raciocínio já registrado em `ach.md § 3.1` pra evitar Task-like component só por causa de `SCHEDULED`.
- **Decisão:** o redirect roda em `PostContent` (render), não em `generateMetadata`. **Alternativa rejeitada:** resolver redirect também na geração de metadata. **Por quê:** duplicaria a query de redirect em 2 lugares só pra cobrir o caso raro "crawler lê metadata de uma URL que vai redirecionar sem nunca renderizar a página" — o 301 real da resposta HTTP já resolve isso pro crawler na prática (ele segue o redirect e re-lê a metadata correta).
- **Decisão:** algoritmo de colisão de slug extraído pra `domain/resolveAvailableSlug.ts` compartilhado entre `create` e `update`. **Alternativa rejeitada:** duplicar a função em `update.ts`. **Por quê:** regra dura 7 (1 export por domain file) + DRY — mesmo padrão já usado em `user/domain/getUserOrThrow.ts` (helper de domain reusado entre múltiplos domain files da mesma feature).
- **Decisão:** `readRedirectSlug` é uma procedure pública nova e enxuta (só resolve `previousSlug` → `slug atual`), não uma extensão de `readBySlug`. **Alternativa rejeitada:** fazer `readBySlug` retornar um shape `Post | { redirectTo: string }`. **Por quê:** `readBySlug` já tem 3 call sites que tratam o erro NOT_FOUND de forma simples (try/catch); mudar seu contrato de saída quebraria esse padrão em todos. Uma procedure nova e pequena é mais barata que uma mudança de contrato — mesmo raciocínio de `readSitemapEntries` em `015-seo-metadata` (procedure pública enxuta em vez de generalizar uma já usada em produção).

## 5. Contratos (boundaries externos)

### Boundary `post.readRedirectSlug` (novo, procedure pública)

```ts
// input
{ slug: string }

// output (sucesso)
{ slug: string } | null   // null = não é um slug antigo conhecido

// errors (codes)
// nenhum — sempre retorna null em vez de lançar (não é uma leitura "esperada existir")
```

### Boundary `post.update` (edita — campos novos no input/output já cobertos pelo boundary existente)

```ts
// input (delta)
{ slug?: string, seoTitle?: string, seoDescription?: string, canonicalUrl?: string }

// output (delta)
{ seoTitle: string | null, seoDescription: string | null, canonicalUrl: string | null }

// errors (codes) — sem mudança: NOT_FOUND | FORBIDDEN (mesmos de hoje)
```

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| `previousSlug` como coluna dedicada (não reusar algum campo genérico) | Guardar histórico serializado num campo JSON | Perderia a constraint `@unique` do banco (dedup de colisão de redirect fica em memória/aplicação, mais frágil) — 1 coluna simples com `@unique` é mais barato que parecer "econômico" com JSON |

## 7. Validação contra invariantes

- [x] Regra dura 1 (nenhum código novo sem teste) — todo domain/procedure novo ganha `__test__` correspondente nas tasks.
- [x] Regra dura 7 (domain-like = 1 export) — `resolveAvailableSlug.ts` e `readRedirectSlug.ts` nascem com export único; `update.ts`/`create.ts` mantêm 1 export cada.
- [x] Regra dura 11 (mudança arquitetural pára e pergunta) — a única superfície nova de 1ª classe seria a tabela de histórico, que foi rejeitada exatamente pra não cruzar essa linha (§ 4 acima); `previousSlug` é uma coluna a mais num model já existente, não um componente novo.
- [x] Regra dura 15 (Domain ≠ Transport) — `domain_updatePost`/`domain_readRedirectSlug` continuam lançando só `TRPCError` no boundary de erro real (NOT_FOUND/FORBIDDEN já existentes); `readRedirectSlug` não lança erro de negócio (retorna `null`).
- [x] Regra dura 16 (validação no boundary) — os 4 campos novos são validados só em `schema.ts` (`updatePostSchema`), domain recebe shape já validado.
- [x] `[NEEDS CLARIFICATION:]` zerado — spec § 5 sem markers abertos; a única decisão irredutível foi resolvida na Phase 0 (spec § 7).

## 8. Riscos

- **Redirect infinito/loop:** se por algum motivo `previousSlug` apontar pra um slug que também virou `previousSlug` de outro post (não deveria acontecer dado o `@unique`, mas por segurança), `readRedirectSlug` só faz 1 hop (slug → slug atual), nunca segue uma cadeia — mitiga qualquer ciclo por construção.
- **Perda de SEO no primeiro slug após 2 edições:** aceito e documentado em spec § 4 (Out of scope) — mitigação é o próprio Autor/Editor evitar editar o slug repetidamente.
- **Campo `canonicalUrl` mal preenchido (URL quebrada) prejudica indexação real:** mitigado só por `z.string().url()` (formato válido), sem verificar se a URL responde — aceito, mesmo nível de validação que `coverImageUrl` já tem hoje.

## 9. Open questions

*(vazio — discovery convergiu, ver spec § 7)*

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`). Plan NÃO escolhe stack — lê de `ach.md`. Se camada relevante de `ach.md` está como `[A DEFINIR]`, marca aqui e bloqueia tasks até resolver.*
