---
type: rule
description: 'A domain-like file exports exactly ONE `domain_<action>` function.'
load: warm
rule_number: PLUGIN-7
fires_on: event
fires_when: 'A domain-like file exports exactly ONE `domain_<action>` function.'
---

# Hard rule PLUGIN-7 — A domain-like file exports exactly ONE `domain_<action>` function.

Domain is business rule; query builder, schema/Zod, and transport glue do not go here.
   *Verification:* `for f in $(find src/server/features -path '*/domain/*.ts'); do n=$(rg -o '^export \{[^}]*\}' "$f" | tr ',' '\n' | wc -l); test "$n" -eq 1 || echo "$f: $n exports"; done` returns empty. **Compliant today** across 30 domain files.
