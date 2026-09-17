---
type: rule
description: 'No direct commit to `main`/`develop`.'
load: warm
rule_number: 32
fires_on: event
fires_when: 'No direct commit to `main`/`develop`.'
---

# Hard rule 32 — No direct commit to `main`/`develop`.

All code work happens on a feature branch created from `develop` (English name, e.g. `feature/016-search-content`), commits following `.commitlintrc` (Conventional Commits, English). PR against `develop` using `.github/pull_request_template.md`; only the owner approves/merges on GitHub. `main` only takes a merge from `develop` at release/deploy, never a commit or a feature-branch merge directly. GitHub branch protection (`main`/`develop`, PR required) is an extra layer — the primary enforcement is this check before you commit.
*Verification:* `git rev-parse --abbrev-ref HEAD` is not `main` nor `develop`. If it is, create/switch to a feature branch before any `git commit`.

