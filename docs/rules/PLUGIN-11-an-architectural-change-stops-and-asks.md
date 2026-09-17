---
type: rule
description: 'An architectural change stops and asks.'
load: warm
rule_number: PLUGIN-11
fires_on: event
fires_when: 'An architectural change stops and asks.'
---

# Hard rule PLUGIN-11 — An architectural change stops and asks.

A new layer / first-class component / cross-module contract / folder refactor needs the architecture owner's sign-off.
*Verification (mid-flight):* `git status --porcelain` shows an `A` for a new first-class directory under `src/`, OR the diff moves folders / introduces a new cross-module import → stop and ask.
12. *(principle — lives in § 1.3. No Task-like component in the project today — no job/queue/scheduler found in scan A.1. If one is introduced, promote to a hard rule with an idempotency trigger.)*
