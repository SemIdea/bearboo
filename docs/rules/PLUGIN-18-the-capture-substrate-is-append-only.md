---
type: rule
description: 'The capture substrate is append-only.'
load: warm
rule_number: PLUGIN-18
fires_on: event
fires_when: 'The capture substrate is append-only.'
---

# Hard rule PLUGIN-18 — The capture substrate is append-only.

`docs/.afm-log/` only takes appends.
*Verification:* `git log -p -- docs/.afm-log/events/ 2>/dev/null | grep -c '^-- \['` returns `0`.
