---
type: rule
description: 'No backwards-compat shim.'
load: warm
rule_number: PLUGIN-10
fires_on: event
fires_when: 'No backwards-compat shim.'
---

# Hard rule PLUGIN-10 — No backwards-compat shim.

The caller does not exist → delete. `// removed for X` pollutes.
*Verification:* `grep -rn "removed\|deprecated\|legacy" src/`. **Compliant today** (0 occurrences).
