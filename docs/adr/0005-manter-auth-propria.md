# ADR-0005 — Manter autenticação própria (não adotar Auth.js/Better Auth)

> **Status:** Aceita
> **Data:** 2026-06-30
> **Decidido por:** dono do produto

## Contexto

`docs/roadmap.md` (Fase 0 — "stack sugerida") listava Auth.js ou Better Auth como opção de auth pro projeto. O código, porém, já implementa autenticação própria: sessão opaca (UUID v4) em `Session` (Postgres, cache Redis), refresh/access token com rotação em cada refresh, hashing de senha com bcrypt (`src/server/features/auth/`, `src/server/entities/session/`, `src/server/integrations/helpers/passwordHashing/`). Não havia registro de por que a lib de auth sugerida no roadmap não foi adotada.

## Decisão

**Manter a autenticação própria como está estruturada hoje** (não migrar pra Auth.js/Better Auth/NextAuth). O trabalho segue sendo **hardening incremental** da implementação atual, não substituição por biblioteca de terceiro.

## Alternativas consideradas

- **Migrar pra Auth.js/Better Auth** — rejeitada: reescreveria toda a camada `auth/session/verifyToken/resetToken` já implementada e testada, sem ganho claro dado que o objetivo do projeto é prática/portfólio de arquitetura própria (ver `prd.md` § 2-3).

## Consequência

- **Fica fácil:** controle total sobre o fluxo de auth pra fins de estudo/portfólio — é o próprio objetivo do produto.
- **Fica difícil:** todo hardening de produção (rotação de token, expiração de sessão, cookies seguras, rate limiting, etc.) é responsabilidade do time, sem as garantias prontas que uma lib madura traria — ver análise de gaps que motivou este ADR (`docs/afm.md` § 3.1 e conversa registrada em `docs/adr/0005` — data 2026-06-30).
- **Débito técnico aceito, rastreado:** gaps de robustez de produção identificados na mesma data — ver `docs/roadmap.md` Fase 3 (Autenticação e permissões) e o gap-list que motivou este ADR.

## Referências

- Doc canônico: `docs/roadmap.md` Fase 0 (nota atualizada) e Fase 3.
- RF relacionado: RF-01.
