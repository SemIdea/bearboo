---
type: gotcha
description: 'Dependabot — alerts are evaluated against the default branch, not the branch you are on'
load: warm
fires_on: event
fires_when: 'if you are reading the Dependabot alert count of this repo and wonder why it is far larger than `npm audit`, or why some alerts never close.'
---

# Dependabot — alerts are evaluated against the default branch, not the branch you are on

**Trigger:** if you are reading the Dependabot alert list of this repo and the number does not match `npm audit`, or an alert stays open although the dependency was removed.

**Behavior:** Dependabot evaluates the **default branch** (`main`) and only re-evaluates when that branch changes. Two consequences lived on 2026-09-16:
- Deleting a manifest does **not** close the alerts that referenced it. `yarn.lock` was deleted in `181f303` (the repo uses `package-lock.json`), and **93 alerts kept referencing the deleted file**, unable to close by code. They were dismissed as `not_used` under feature 029.
- The list lags the branch you work on: `main` still carried the vulnerable versions, so 4 `package.json`-manifest alerts (vitest, postcss) stay open until the fix reaches `main` — merging into `develop` is not enough.

**Solution:** the ground truth for the current lockfile is `npm audit` (run it; do not trust the count in the GitHub UI). Use the API to separate the populations:
- `gh api "/repos/<owner>/<repo>/dependabot/alerts?state=open&per_page=100"` — the open set;
- dismiss a stale one with `state=dismissed`, `dismissed_reason=not_used` (audited and reversible);
- an alert tied to the current manifest closes by itself once the fixed version reaches the default branch.

**Ref:** `docs/features/029-dependency-vulnerability-remediation/spec.md` § 1; commit `181f303`; GitHub docs — Dependabot alerts track the default branch.
