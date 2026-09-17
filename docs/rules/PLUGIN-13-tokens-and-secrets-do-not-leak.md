---
type: rule
description: 'Tokens and secrets do not leak.'
load: warm
rule_number: PLUGIN-13
fires_on: event
fires_when: 'Tokens and secrets do not leak.'
---

# Hard rule PLUGIN-13 — Tokens and secrets do not leak.

Never log a token in the clear. Redact in errors. Never commit `.env`. **Covers `docs/sessions/`** — versioning narrative is a new leak path: the agent cites the command it ran, and the command had the key.
*Verification:* `git diff --staged | grep -nE "(token|secret|api[_-]?key|password|bearer)\s*[:=]\s*['\"][^'\"]+"` returns 0; `git diff --staged --name-only | grep -E "(^|/)\.env"` empty; and about sessions, `git diff --staged -- docs/sessions/ | grep -nE "(sk-|ghp_|AIza|xox[baprs]-|eyJ[A-Za-z0-9_-]+\.eyJ)"` returns 0 (known credential prefixes — OpenAI/GitHub/Google/Slack/JWT).
