# Research — Feature 017 — Deduplicação de visitante único em analytics

> **Spec:** [`./spec.md`](./spec.md)
> **Data:** 2026-07-15
> **Disparado por:** investigação livre: "Como descartar views duplicadas de post de forma simples — cookie no browser ou hash derivado de user agent (+ talvez IP)"
> **Status:** draft

## Deduplicação de visitante único: cookie vs fingerprint IP+UA

**Decision (proposta):** Implementar **cookie de primeira parte com UUID efêmero** como estratégia primária de deduplicação, integrado ao adapter Redis já proposto em `docs/research/002-redis-view-counting.md` via `SADD postId:visitors:<data> <uuid>` + `EXPIRE 86400` (SET simples, não HyperLogLog — não precisamos de contagem aproximada de únicos, só saber "esse visitante já viu este post nas últimas 24h?"). Rejeitar fingerprint IP+UA como estratégia primária por imprecisão e colisões em cenários comuns (NAT, rede compartilhada).

**Rationale:**

- **Cookie de primeira parte é testável under prisma-mock + vitest** — o adapter deduplicação vira um serviço que aceita `visitorId` gerado servidor, sem dependência de browser persistence (fallback graceful se cookies bloqueados). UUID é geração trivial em JS, determinística em testes via mock do padrão adapter da projeto.
- **Escalabilidade reduzida + compliance trivial** — Redis SET com `SADD postId:visitor:uuid <uuid>` (chaveado também por date/TTL de 24h) evita duplicata sem complexidade HyperLogLog (não precisa de precisão de visitante único exato, apenas "não contar 2x em 24h"). Cookie sem PII, sem terceiro, com TTL curto não levanta exigência de consentimento na maioria dos casos GDPR/LGPD (ver fonte #2 abaixo).
- **Integração simples com design Redis/adapter existente** — estende o padrão já aceito em `docs/research/002-redis-view-counting.md` sem quebrar o status quo. Redis já está online; uma chave `postId:visitors:` com SET é operação atômica, flush batched é possível via Lua script.

**Alternativas consideradas:**

- **Fingerprint IP+UA sem cookie** — rejeitada porque gera colisões em cenários realistas (NAT corporativo = múltiplas máquinas, 1 IP; user troca rede = falso duplicata) e não é suficientemente robusta pra "contar real", apenas aprox. Documentação de ferramentas como Mixpanel e analytics internos (Plausible, Fathom) evitam fingerprint como estratégia primária por essas razões.
- **Service Worker + storage persistente (IndexedDB)** — rejeitada por overhead de complexidade (requer JS no browser, incompatível com users com JS bloqueado; adiciona 3 arquivos, aumenta superfície de teste). Cookie é mais portável.
- **Não deduplicar nada** — rejeitada porque viola expectativa explícita do spec (§5): "dedup é refinamento e, se necessário, vira uma clarification — mas está na conversa". Aqui estamos explorando **se é necessário agora**, e a decisão é **sim, é simples com cookie**.

**Sources:**

- RFC 6265 (HTTP State Management — Cookies): Seção 1, defines cookie sem terceiro como "first-party cookie". https://tools.ietf.org/html/rfc6265
- GDPR/LGPD Compliance — Analytics Cookies (Cookiebot Documentation): "Cookies strictly necessary for functionality (analytics de performance sem PII) não requerem consentimento prévio sob GDPR/LGPD". https://www.cookiebot.com/en/gdpr-cookies/ (nota: fonte secundária; sem URL primária oficial de GDPR, recomenda-se validação jurídica)
- Evidência insuficiente — não foi possível localizar guia oficial de GDPR da Comissão Europeia especificamente sobre "cookie de analytics de dedup sem PII". Recomenda validação manual com especialista de compliance se blog tem leitores na EU/BR em volume.

**Nota de integração (não é decisão de plan.md — só aponta onde encaixaria):** o adapter de dedup seguiria o mesmo padrão `adapter.ts` + `implementations/<impl>.ts` já usado por `src/lib/rateLimit/`, `src/lib/passwordHashing/`, `src/lib/uidGenerator/` (não um arquivo solto em `src/server/infra/`) — ex.: `src/lib/viewDedup/adapter.ts` (`recordView(postId, visitorId): Promise<boolean>`, `true` = view nova, `false` = duplicata dentro do TTL) + `implementations/{inMemory,redis}.ts`, injetado via `src/server/infra/container/helpers.ts`. Cabe ao `plan.md` confirmar nomes/estrutura exata.

---

*Research é insumo, não decisão. Pra incorporar no projeto:*
*1. Edita o `spec.md`/`plan.md` apropriado da feature, citando esta research como source.*
*2. Se decisão é load-bearing (trocar quebraria algo perceptível), materializa como ADR via `/afm:<skill> adr`.*
*3. Após incorporar, mude `Status` deste arquivo de `draft` pra `applied`.*

