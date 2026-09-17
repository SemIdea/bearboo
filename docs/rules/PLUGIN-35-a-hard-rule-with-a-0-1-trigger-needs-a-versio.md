---
type: rule
description: 'A hard rule with a 0/1 trigger needs a versioned runner in the gate'
load: warm
rule_number: PLUGIN-35
fires_on: event
fires_when: 'A hard rule with a 0/1 trigger needs a versioned runner in the gate'
---

# Hard rule PLUGIN-35 — A hard rule with a 0/1 trigger needs a versioned runner in the gate

# Hard rule PLUGIN-35 — A hard rule with a 0/1 trigger needs a versioned runner in the gate.

    A trigger written only as prose in the doc works only as long as someone remembers to run it. The agent forgets exactly when context gets tight. A rule that promises verification with no runner is a **phantom gate**. It is worse than no gate, because it buys trust it cannot back up.

    *Verification (pre-commit):* [`test/rules/35-gate-complete.sh`](../../test/rules/35-gate-complete.sh) calls `test/guardrails.sh --audit`. This cross-checks `afm.md § 3` against `test/rules/*.sh` **in both directions**. A rule with `pre-commit`/`ci` surface and no runner fails. A runner with no matching rule fails too. A rule with `agente` (agent) surface — a judgment call, like rule 11 — is not covered.
