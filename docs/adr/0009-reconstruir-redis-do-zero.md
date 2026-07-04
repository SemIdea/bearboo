# ADR-0009 — Reconstruir a camada de cache Redis do zero

> **Status:** Aceita e implementada quanto à remoção; reconstrução futura pendente
> **Data:** 2026-07-01
> **Decidido por:** dono do produto

## Contexto

Na data da decisão, a implementação de cache/sessão via Redis (`src/server/integrations/repositories/cache/`, feature flags `enableSessionCaching`/`enablePostCaching`/`enableUserCaching` em `src/config/featureFlags.ts`, index por `accessToken`/`refreshToken` na `SessionEntity`) foi avaliada pelo dono do produto como inadequada e sem nada reaproveitável, no contexto do refactor maior do server.

## Decisão

Remover a implementação atual de cache Redis completamente. A reconstrução fica pra quando houver desenho concreto do que a nova camada deve fazer — não é retrabalho imediato dentro deste refactor. A nova classe base de entidades (ADR-0007) nasce **sem** conceito de cache, sem slot reservado.

## Alternativas consideradas

- **Refatorar incrementalmente a implementação atual** — rejeitada pelo dono do produto: não há nada reaproveitável na implementação hoje.
- **Manter a interface de cache como slot vazio na nova base de entidades** — rejeitada por agora (ver ADR-0007): acoplaria a decisão de entidades a um desenho de Redis que ainda não existe.

## Consequência

- **Fica fácil:** remove a superfície de bugs/dívida técnica atual do cache — inclusive parte do que `docs/features/001-auth-hardening/spec.md` apontava (sessão cacheada sem expiração real).
- **Fica difícil:** `Session`/`Post`/`User` perdem a camada de cache até a reconstrução — sem impacto funcional imediato (Postgres continua sendo source of truth, `docs/ach.md` § 1), só perde o ganho de performance do cache enquanto não for refeito.
- **Dependência com `docs/features/001-auth-hardening/spec.md`:** reconciliada em 2026-07-04; os critérios de hardening dependem de `Session` no Postgres e não exigem cache Redis.
- **Não revoga ADR-0003** (decisão de usar Redis como tecnologia de cache) — a troca é de implementação, não da escolha de usar Redis.

## Referências

- `docs/adr/0003-redis-para-cache-e-sessao.md` (decisão de tecnologia, ainda válida).
- `docs/features/001-auth-hardening/spec.md` (precisa reconciliar após esta decisão).
