---
type: rule
description: 'The boundary emits one canonical log line per call; the logger never carries a secret.'
load: warm
rule_number: 36
fires_on: event
fires_when: 'The boundary emits one canonical log line per call; the logger never carries a secret.'
---

# Hard rule 36 — The boundary emits one canonical log line per call; the logger never carries a secret.

Every procedure call emits exactly one wide structured event at the boundary (`withCanonicalLog`), success or failure — JSON in prod, pretty in dev (`env.nodeEnv`). Enrich a line with `ctx.log.add({ ... })`; `LogFields` is scalar-only, so a raw `input`/`ctx`/`user` object cannot be dumped (also covering PII), and on emit a scrub drops a field named after a secret (`token`/`password`/`secret`/`authorization`/`cookie`) and masks a known credential shape in a value (the rule-13 prefixes) (rule 13). No `console.*` in `src/server/**`, except the sanctioned mock mailer transport. Logs go to stdout as one event stream (12-Factor); shipping/aggregation is the environment's job. See ADR-0022.
*Verification:* `rg -n "console\.(log|info|warn|error|debug)" src/server --glob '!**/__test__/**'` returns only `src/server/integrations/gateway/mailer/transports/console.ts` (the mock mailer). **Compliant today** — added in `025-structured-logging` (2026-08-24, ADR-0022).

---

