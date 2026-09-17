---
type: rule
description: 'A route handler (`src/app/api/**/route.ts`) is thin.'
load: warm
rule_number: 31
fires_on: event
fires_when: 'A route handler (`src/app/api/**/route.ts`) is thin.'
---

# Hard rule 31 — A route handler (`src/app/api/**/route.ts`) is thin.

It delegates to the tRPC handler; no inline business rule.
*Verification:* `find src/app/api -name route.ts | xargs wc -l` — all < 80 lines. **Compliant today** (only route: `src/app/api/trpc/[trpc]/route.ts`).
