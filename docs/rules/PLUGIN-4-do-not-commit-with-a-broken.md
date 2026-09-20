---
type: rule
description: 'Do not commit with a broken type-check.'
load: warm
rule_number: PLUGIN-4
fires_on: event
fires_when: 'Do not commit with a broken type-check.'
---

# Hard rule PLUGIN-4 — Do not commit with a broken type-check.

   *Verification:* `npx tsc --noEmit`.
