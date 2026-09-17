---
type: rule
description: 'Domain/Procedure does NOT import `PrismaClient`/`@prisma/client`/the Prisma driver directly.'
load: warm
rule_number: 30
fires_on: event
fires_when: 'Domain/Procedure does NOT import `PrismaClient`/`@prisma/client`/the Prisma driver directly.'
---

# Hard rule 30 — Domain/Procedure does NOT import `PrismaClient`/`@prisma/client`/the Prisma driver directly.

Data access goes through the injected `ctx.repositories`; `src/server/models/*`, `src/server/infra/drivers/prisma.ts`, and the test seam `src/test/prisma/` are the intentional data-layer exception.
*Verification:* `rg -n "from.*@prisma/client|new PrismaClient|@/server/infra/drivers/prisma" src/server/features/*/domain/*.ts src/server/features/*/procedures/*.ts` returns 0. **Compliant today.**
