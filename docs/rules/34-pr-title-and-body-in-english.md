---
type: rule
description: 'PR title and body in English.'
load: warm
rule_number: 34
fires_on: event
fires_when: 'PR title and body in English.'
---

# Hard rule 34 — PR title and body in English.

It mechanizes in the GitHub artifact the § 1.3 principle "code in English" (branch name, PR title/body, labels — process identifiers, always English). Applies to a new PR (forward — PRs opened before this rule stay as they are). Covers title and body (the durable artifact that becomes history); does **not** cover the PR conversation/review, which follows the interlocutor's language, like chat. `.github/pull_request_template.md` is in English — a template that asks in Portuguese harvests Portuguese answers.
*Verification:* `gh pr view <N> --json title,body -q '.title + "\n" + .body' | grep -nP '[À-ÿ]'` returns empty. Manual today (check before opening/at review); becomes a CI step when the pipeline (`.github/workflows/ci.yml`, PR #208) lands in develop. **Limit:** the grep catches accent, not accent-free Portuguese — but in long PR prose the accent is nearly inevitable, which makes the proxy strong; accent-free Portuguese that slips through is still a violation, caught at review.

