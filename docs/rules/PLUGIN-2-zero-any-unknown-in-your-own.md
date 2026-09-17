---
type: rule
description: 'Zero `any` / `unknown` in your own helpers.'
load: warm
rule_number: PLUGIN-2
fires_on: event
fires_when: 'Zero `any` / `unknown` in your own helpers.'
---

# Hard rule PLUGIN-2 — Zero `any` / `unknown` in your own helpers.

   *Verification:* `grep -nE "\bany\b|\bunknown\b" src/` in non-boundary files.
