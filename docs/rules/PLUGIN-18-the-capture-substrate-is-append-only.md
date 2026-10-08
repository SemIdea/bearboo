---
type: rule
description: 'The capture substrate is append-only.'
load: warm
rule_number: PLUGIN-18
fires_on: event
fires_when: 'The capture substrate is append-only.'
---

# Hard rule PLUGIN-18 — The capture substrate is append-only.

The AFM_HOME ledger only takes appends.
*Verification:* the ledger lives in the AFM_HOME state store (`docs/.afm-log/` is `.gitignore`d and never committed), written only through `afm` append operations — `afm install git record` appends HEAD as a task event, the post-commit hook runs it. There is no in-repo artifact to diff; the append-only invariant is held by the store, not by a git check.
