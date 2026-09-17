---
type: rule
description: 'The prose of an artifact is English'
load: warm
rule_number: PLUGIN-37
fires_on: event
fires_when: 'The prose of an artifact is English'
---

# Hard rule PLUGIN-37 — The prose of an artifact is English

# Hard rule PLUGIN-37 — The prose of an artifact is English.

    Rule 21 covers only an identifier or a test name with a non-ASCII character. It is blind to prose: a `.md` written entirely in Portuguese passes it clean. That is how this repo reached 2026-08 with 175 Portuguese doc files while the gate said green. Every artifact — doc, code, DB, comment, test, skill `description`, hook-injected text — is written in **English under ASD-STE100**. The **chat reply follows the language the user speaks**; a reply is not an artifact, and **a request made in Portuguese is not a request FOR Portuguese** — that conflation is the measured failure mode, not a hypothetical one (2026-08-27).

    The rule has two tiers, and they are not the same strength:

    - **Code, test, and comment: inalienable.** No explicit request overrides it, in any language and any project. This is rule 21 restated for the surface rule 21 left in judgment (the comment). An identifier split across two languages breaks search, autocomplete, and the agent's own reasoning.
    - **Document: English by default, and the operator may override it explicitly.** A doc has one human audience and the operator owns the choice of language for it. The override has to be stated, not inferred from the language of the request.

    The **end-user-facing strings of a consumer app are the exception to both**: the app language is a product decision, it lives in that project's `prd.md`, and it is never forced.

    *Verification (two moments, one measurement):* the threshold lives in [`tools/afm-lang.sh`](../../plugins/afm/framework-template/tools/afm-lang.sh) and nowhere else (rule 34). `afm-pre-edit.sh` runs it at `PreToolUse` on the text about to be written and names the tier, so the verdict arrives while the text is still a proposal; [`test/rules/37-prose-language.sh`](../../test/rules/37-prose-language.sh) runs the same tool at commit. Two copies of a measured threshold drift, and the commit gate would then contradict the hook that had just approved the write. The signal is the **density** of Portuguese function words in prose, not their presence. Presence is a guaranteed false positive: every doc here quotes `**Gatilho:**`, `agente` and `### Migração de consumer` — literals the gates need to stay Portuguese. **The threshold is measured, not chosen** (§ 1.3, "a number that enters a decision carries its provenance"): the English population (n=117) peaks at **0.69** and the Portuguese population (n=29) bottoms at **1.52**, so **1.0** falls in the gap between them. `MIN_HITS=3` removes the two 2-hit outliers at the top of the English population. **Two structural exclusions:** (a) `plugins/ste/test/fixtures/*-pt.md` — the `ste` plugin lints Portuguese, and its Portuguese fixtures are the input the test proves something about; (b) `CHANGELOG-archive.md` — frozen historical record, not a live artifact. Both are counter-proved: remove (a) and the runner reports all three fixtures (densities 23.53, 21.43, 16.00); put it back and they go silent.
