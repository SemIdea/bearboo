---
type: rule
description: 'File ≤ 300 lines.'
load: warm
rule_number: PLUGIN-6
fires_on: event
fires_when: 'File ≤ 300 lines.'
---

# Hard rule PLUGIN-6 — File ≤ 300 lines.

Exceptions with a header that explains.
   *Verification:* `find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -name "*.test.*" -print0 | xargs -0 wc -l | awk '$2 != "total" && $1 > 300'`. **2 production files exceed today** (scan 2026-08-22): `src/server/models/post.ts` (416) and `src/server/features/post/schema.ts` (314) — neither is from this feature; treated as forward-only tech debt (§ 3.1), not a block. *(The command also lists `src/server/models/__test__/prismaModels.ts` (429) — a test file the `*.test.*` filter misses because of the `__test__/` naming; outside the rule's scope, which is production code.)*
