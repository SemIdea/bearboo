---
type: rule
description: 'A doc under `docs/` carries no FILESYSTEM absolute path'
load: warm
rule_number: PLUGIN-36
fires_on: event
fires_when: 'A doc under `docs/` carries no FILESYSTEM absolute path'
---

# Hard rule PLUGIN-36 — A doc under `docs/` carries no FILESYSTEM absolute path

# Hard rule PLUGIN-36 — A doc under `docs/` carries no FILESYSTEM absolute path.

    A leading `/` means the bundle root, which is `docs/` itself. That is the link form OKF v0.2 recommends, because it survives a file move. A runbook with `/home/<someone>` runs only on the machine that wrote it. An agent reading it from a different clone either obeys the wrong path or hallucinates a fix. A path relative to the repo root keeps the markdown executable from any checkout. It also saves the context that explaining the path would cost.

    *Verification (pre-commit):* [`test/rules/36-absolute-path.sh`](../../test/rules/36-absolute-path.sh). **Two structural exclusions:** (a) `docs/sessions/` is excluded. `afm-session-start.sh` reads the `cwd:` line (`grep -lF "cwd: $PWD"`) to match a pending handoff. The directory grows one entry per session, which would break a ratchet that only shrinks. (b) The pattern requires a segment **after** the user (`/home/<user>/<something>`). Otherwise, a doc that describes this very trigger would flag itself.
