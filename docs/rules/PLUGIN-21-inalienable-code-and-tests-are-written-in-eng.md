---
type: rule
description: 'INALIENABLE — code and tests are written in English'
load: warm
rule_number: PLUGIN-21
fires_on: event
fires_when: 'INALIENABLE — code and tests are written in English'
---

# Hard rule PLUGIN-21 — INALIENABLE — code and tests are written in English

Identifiers, function names, test names, and comments stay in English, in any language and any project. The trigger below covers identifiers and test names, and comments are part of the rule but stay in judgment. **User-facing strings follow the product's own language** — this rule is about the code, not the content the end user reads. This is not a style preference. An identifier split across two languages breaks search, autocomplete, and the agent's own reasoning, since most of the world's code is written in English.

    *Verification:* `grep -rqP '\b(?:function|class|const|let|var|def|interface|type|enum|describe|it|test)\b\s*\(?\s*["\x27]?[A-Za-z_$][\w$ ]*[^\x00-\x7F]' {{src-path}}` returns **1** (no hit). **What the command proves:** an identifier or test name with a non-ASCII character (`criarPedidoComEndereço`, `it("devolve o pedido válido")`). **What it does NOT prove, and why:** (a) unaccented Portuguese (`criarPedido`) passes — that stays judgment, § 5. (b) **A comment falls outside its scope.** English prose uses em dashes, curly quotes, and ellipses, so non-ASCII in a comment is noise, not signal. The `\b` in the alternation is load-bearing: without it, `it` would match inside the word "delimitam", and the trigger would flag it for the wrong reason. This regex requires `grep -P` (GNU).
