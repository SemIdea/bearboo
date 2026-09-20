---
type: rule
description: 'One responsibility per file.'
load: warm
rule_number: PLUGIN-5
fires_on: event
fires_when: 'One responsibility per file.'
---

# Hard rule PLUGIN-5 — One responsibility per file.

A vague name ("manager", "utils", "helpers" without a domain prefix) = split.
   *Verification:* `find src -type f \( -iname "*manager*" -o -iname "*utils*" -o -iname "*helpers*" \)` returns 0 without a domain prefix. Today it returns `src/lib/utils.ts` and `src/server/infra/container/helpers.ts` — see § 3.1 forward-only.
