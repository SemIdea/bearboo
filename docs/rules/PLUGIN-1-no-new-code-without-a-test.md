---
type: rule
description: 'No new code without a test'
load: warm
rule_number: PLUGIN-1
fires_on: event
fires_when: 'No new code without a test'
---

# Hard rule PLUGIN-1 — No new code without a test

Includes a type test.

   *Verification:* `git diff --staged --name-only | grep -qE '\.(test|spec)\.'` — a commit that adds code brings a test with it. The command proves only half the rule: it proves a test **exists** in the commit, not that it **covers the new path**. That stays judgment, and it lives in § 5. It gives a false positive on a pure refactor, a rename, a revert, or a config-only commit. The rule does not apply there, and the trigger is not the oracle.
