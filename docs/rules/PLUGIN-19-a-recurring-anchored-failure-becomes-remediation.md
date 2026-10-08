---
type: rule
description: 'A recurring, anchored failure becomes remediation, not silent recurrence'
load: warm
rule_number: PLUGIN-19
fires_on: event
fires_when: 'A recurring, anchored failure becomes remediation, not silent recurrence'
---

# Hard rule PLUGIN-19 — A recurring, anchored failure becomes remediation, not silent recurrence

Every `sig=` that appears **≥2×** in `afm failures promotable` must have a remediation artifact (procedure/learning/gotcha/rule) that **cites it**. *(Anti-Goodhart caveat — STOP, arXiv:2310.02304: the trigger measures **traceability**, not the quality of the remedy. An empty procedure that only cites the `sig=` passes the grep, and quality stays at the human gate. This rule only guarantees no recurring failure stays **orphaned**. Recognition of the failure is always by external signal — CRITIC, #3.)*

    *Verification:* run `afm failures promotable` — it yields only the signatures that recurred ≥2× minus the closed ones, read from the AFM_HOME state store. Every `sig=` it prints must be cited by a remediation artifact (a procedure, learning, gotcha, rule or ADR). In this repo the slot is dormant: `afm failures promotable` reports none, so the check passes vacuously until the evolve loop starts recording failures.
