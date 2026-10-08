---
type: rule
description: 'Tokens and secrets do not leak.'
load: warm
rule_number: PLUGIN-13
fires_on: event
fires_when: 'Tokens and secrets do not leak.'
---

# Hard rule PLUGIN-13 — Tokens and secrets do not leak.

Never log a token in the clear. Redact in errors. Never commit `.env`. **Covers the AFM_HOME session store** — versioning narrative is a new leak path: the agent cites the command it ran, and the command had the key.
*Verification:* `afm gate` runs the shipped `PLUGIN-13-secrets.sh` over the staged diff — it flags any added `(token|secret|api[_-]?key|password|bearer)[:=]"…"` pair, any token in a recognizable format (`sk-`/`ghp_`/`AIza`/`xox`/JWT — OpenAI/GitHub/Google/Slack/JWT) and any versioned `.env` (`.env.example`/`.env.sample` stay out). The AFM_HOME session store lives outside git (its directory is gitignored), so its narrative is never staged and cannot be committed.
