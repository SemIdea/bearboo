---
type: rule
description: 'A `/docs/` edit does not collapse the doc.'
load: warm
rule_number: PLUGIN-17
fires_on: event
fires_when: 'A `/docs/` edit does not collapse the doc.'
---

# Hard rule PLUGIN-17 — A `/docs/` edit does not collapse the doc.

A rewrite that deletes more than half the lines in one edit stops and needs explicit review.
*Verification:* `git diff --numstat -- docs/ | grep -vE '(^|/)\.afm-log|(^|/)_focus\.md$|(^|/)sessions/' | awk '$2 > 20 && $2/($1+$2+1) > 0.5 {print}'` returns empty.
