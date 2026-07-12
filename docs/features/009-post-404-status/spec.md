# Feature 009 — `/post/[slug]` responde 404 real pra slug inexistente

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US herdada de `docs/features/002-post-slug/` (visualizar post por slug).
> **Status:** won't-fix por ora (2026-07-12 — hipótese original refutada empiricamente; ver § 5 e `plan.md` § 9. Dono decidiu aceitar como limitação conhecida do Next 16 Cache Components em vez de investir em infra nova (middleware/Edge) agora. Reabrir se virar bloqueio real, ex. SEO passar a exigir 404 de verdade.)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

`docs/ust.md` § Pendências Técnicas registra: `/post/[slug]` já chama `notFound()` corretamente quando o slug não existe (corrigido 2026-07-11), mas o status HTTP da resposta continua `200`, não `404`. Causa: `PostContent` roda dentro de `<Suspense>` (streaming) — o shell da resposta já é enviado com `200` antes do `notFound()` disparar dentro do boundary, então o status não muda mais. Bots que checam status HTTP não veem um 404 real, o que é relevante pra Fase 5 (SEO) do roadmap.

## 2. Critério de sucesso observável

- [x] Uma requisição a `/post/<slug-inexistente>` responde com status HTTP `404`, não `200`.
- [x] Uma requisição a `/post/<slug-existente-published>` continua respondendo `200` com o conteúdo do post.

## 3. Cenários

```gherkin
Scenario: Slug inexistente
  Given nenhum post tem o slug "nao-existe"
  When alguém acessa GET /post/nao-existe
  Then a resposta HTTP tem status 404

Scenario: Slug existente
  Given um post PUBLISHED com slug "meu-post"
  When alguém acessa GET /post/meu-post
  Then a resposta HTTP tem status 200
  And o conteúdo do post aparece na página
```

## 4. Out of scope

- Qualquer outra página com o mesmo padrão de streaming (não há outra rota nessa situação hoje).
- SEO adicional (sitemap, robots.txt, RSS) — Fase 5 do roadmap, itens separados.

## 5. Assumptions / Open questions

- ~~Trade-off aceito explicitamente pelo dono (gate desta sessão, 2026-07-12): remover o `<Suspense>` em torno de `PostContent` perde o fallback "Loading post..." — a página passa a bloquear a resposta até os dados chegarem (SSR síncrono), em troca do status HTTP correto.~~ **Refutado empiricamente ao implementar** (ver `plan.md` § 9): a mudança não é uma troca de UX, é impossível sob `cacheComponents: true` — `next build` falha (`Uncached data was accessed outside of <Suspense>`). Revertido.
- ~~`[NEEDS CLARIFICATION:]` — a alternativa real (checagem de slug fora do Cache Components, ex. `middleware`/`proxy` no Edge) é infra nova (regra dura 11) e requer decisão do dono.~~ **Resolvido em 2026-07-12**: dono optou por aceitar a limitação por ora em vez de investir na infra nova. Ver `plan.md` § 9.

## 6. Dependências

- Nenhuma. Item avulso derivado de `docs/features/002-post-slug/` (já `done`), não reabre esse spec.

## 7. Clarifications

_(vazio)_

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
