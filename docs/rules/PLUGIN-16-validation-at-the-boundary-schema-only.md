---
type: rule
description: 'Validation at the boundary — schema only at a procedure''s input/output.'
load: warm
rule_number: PLUGIN-16
fires_on: event
fires_when: 'Validation at the boundary — schema only at a procedure''s input/output.'
---

# Hard rule PLUGIN-16 — Validation at the boundary — schema only at a procedure''s input/output.

Zod validates at (a) a procedure's `.input()`/`.output()` (`src/server/features/<feature>/schema.ts`), (b) an external payload. Domain/Model receives an already-validated shape.
*Verification:* `rg -n "z\.|zod" src/server/models src/server/features/*/domain/*.ts` returns 0. **Compliant today.**
