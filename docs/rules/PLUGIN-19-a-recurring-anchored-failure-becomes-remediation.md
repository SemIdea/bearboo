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

    *Verification:* `for s in $(afm failures promotable | grep -ohE 'sig=[A-Za-z0-9_-]+' | sed 's/sig=//'); do grep -ql "$s" docs/procedures/*.md docs/learnings/*.md docs/gotchas/*.md docs/rules/*.md docs/adr/*.md 2>/dev/null || echo "$s NO REMEDIATION"; done` returns empty. (`afm failures promotable` already yields only the signatures that recurred ≥2× minus the closed ones — the AFM_HOME state store replaced the removed `docs/.afm-log-failures/` glob.)
