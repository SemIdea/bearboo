---
type: rule
description: '`docs/_focus.md` is small, overwritable slot-state.'
load: warm
rule_number: PLUGIN-20
fires_on: event
fires_when: '`docs/_focus.md` is small, overwritable slot-state.'
---

# Hard rule PLUGIN-20 — `docs/_focus.md` is small, overwritable slot-state.

*Verification:* `{ [ -f docs/_focus.md ] && wc -l < docs/_focus.md || echo 0; } | awk '$1 > 40 {print "INCHOU"}'` returns empty.

### Project-specific rules (from 30)

