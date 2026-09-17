# adr

* [ADR-0001 — tRPC ao invés de REST](0001-trpc-ao-inves-de-rest.md) - 
* [ADR-0002 — Prisma como ORM](0002-prisma-como-orm.md) - 
* [ADR-0003 — Redis para cache e sessão](0003-redis-para-cache-e-sessao.md) - 
* [ADR-0004 — Radix UI + CVA (design system estilo shadcn)](0004-radix-ui-cva-design-system.md) - 
* [ADR-0005 — Manter autenticação própria (não adotar Auth.js/Better Auth)](0005-manter-auth-propria.md) - 
* [ADR-0006 — Reorganização do server por feature (domain + procedures)](0006-reorganizacao-server-por-feature.md) - 
* [ADR-0007 — Entidades Prisma centralizadas em `src/server/models/`](0007-entidades-prisma-em-server-models.md) - 
* [ADR-0008 — Separar lib pura (`src/lib/`) de infra (`src/server/infra/`)](0008-separar-lib-pura-de-infra.md) - 
* [ADR-0009 — Reconstruir a camada de cache Redis do zero](0009-reconstruir-redis-do-zero.md) - 
* [ADR-0010 — DTOs substituídos por schemas Zod no boundary de input/output](0010-dto-substituido-por-zod-no-boundary.md) - 
* [ADR-0011 — `prisma-mock` como fake do PrismaClient nos testes](0011-prisma-mock-para-testes.md) - 
* [ADR-0012 — Cookie jar + `responseMeta` pra emitir cookies HttpOnly a partir de procedures tRPC](0012-cookie-jar-httponly-no-trpc.md) - 
* [ADR-0013 — Gateway-like Redis pra contagem/dedup de views (não Helper-like)](0013-gateway-redis-view-counter.md) - 
* [ADR-0014 — Breakdown de analytics: eventos brutos retidos 30 dias, sem IP persistido](0014-analytics-breakdown-retencao-30-dias-sem-ip.md) - 
* [ADR-0015 — Gateway `mediaStorage` pluggável: local nesta rodada, port pronto pra CDN de imagem](0015-media-storage-gateway-pluggavel.md) - 
* [ADR-0016 — Centralizar o mapeamento Domain error → TRPCError no boundary](0016-centralizar-mapeamento-domain-error-trpcerror.md) - 
* [ADR-0017 — ErrorRegistry: código de domínio namespaced (`"auth.invalid_credentials"`) resolvido em `DomainError`](0017-error-registry-domain-error-namespaced.md) - 
* [ADR-0018 — Metadata rico de erro (`retryable`/`level`) + convenção bug vs. recuperável](0018-error-metadata-and-bug-recoverable-convention.md) - 
* [ADR-0019 — Tradução de erro centralizada em middleware + transporte fora do vocabulário de domínio](0019-boundary-error-centralization-and-transport-inversion.md) - 
* [ADR-0020 — `DomainError` renomeado para `AppError`](0020-rename-domainerror-to-apperror.md) - 
* [ADR-0021 — `/docs/` adota Simplified Technical English (nível "espírito"), em inglês](0021-docs-adopt-simplified-technical-english-spirit.md) - 
* [ADR-0022 — Structured logging: one canonical log line per call](0022-structured-logging-canonical-line.md) - 
* [ADR-0026 — Integration tests against real Postgres via Testcontainers](0026-integration-tests-testcontainers.md) - 
* [ADR-0027 — Native Postgres full-text search (tsvector/ts_rank)](0027-native-fulltext-search.md) - 
