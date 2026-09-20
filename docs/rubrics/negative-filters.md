---
type: rubric
description: Rejects what must not become a durable doc, because a false constraint is poison.
load: warm
fires_on: op-call
called_by: ["remediate", "reconcile"]
fires_when: 'something is about to become a durable doc'
---

# Rubric — negative-filters (what NOT to promote to durable doc)

> This is a rejection checklist for the entry gate of `gotcha`/`reconcile`/`remediate`. It is the negative side of principle #5 ("do not invent"): **a false constraint is poison**. It is worse than no doc, because it hardens into a future wrong refusal or error. This applies from v3.1.0 (Phase 4 of the v3.2 initiative). Field evidence (ai-memory): in one real corpus, about 28% of pages were low-signal sessions that only polluted retrieval.

## Reject (this does NOT become a gotcha, learning, rule, or procedure)

| Anti-pattern | Why it is poison | What to do instead |
|---|---|---|
| **Negative claim about a tool** ("tool X is broken", "library Y does not work") | It hardens into a **fossil refusal**. After the tool is fixed, the doc still makes the next agent avoid it for no reason. | Record the concrete *workaround*, if it is durable. Do not record the verdict "it is broken". Remove the entry when the cause is fixed, because it is transient. |
| **Transient failure** (fixed on retry, see § 5.1, a missing credential or binary at that moment, a setup state) | It becomes a **dead constraint**. The condition no longer exists, so the doc lies to the future reader. | Keep it as evidence in `.afm-log-failures/`, not as an artifact. Capture the *retry or fix pattern*, not the temporary failure. |
| **One-off narrative** ("in this session I did A, B, C") | The timeline already lives in `docs/.afm-log/` and `sessions/`. As a normative doc, it is only noise. | Use an episodic handoff (`sessions/`), not a semantic doc. |
| **User-visible status** ("the build passes now", "deploy ok") | This is a momentary state, not knowledge. | Use `_focus.md` (state) or a handoff. Do not use `gotcha` or `adr`. |
| **Release marker or smoke test** ("v0.1.1 published", "echo ok") | This is operational, not a reusable lesson. | Use `notes` or a log. Never a rule or gotcha. |
| **Vibe-rule with no trigger** (KISS, DRY treated as a "rule") | Without an executable 0/1 trigger, it is not a hard rule (see #3). | Record it as a principle in `afm.md § 1.3`, not in § 3. |

## Promotion test (pass the gate IF)

1. **Does it have a durable antidote?** It must be a concrete action that prevents the problem, not just a verdict.
2. **Does the claim survive a fix to its cause?** If it "goes away when X is fixed", it is transient. Reject it.
3. **Does another agent without my memory need this to avoid breaking something?** (#1 — otherwise it is memory or state, not doc.)
4. **Did it happen ≥2 times?** Or is it a user correction? Or is it external SDK documentation? (#5 — otherwise it is evidence, not yet an artifact.)

All four **yes** answers promote the item. Any structural **no** keeps it as evidence or state, not a durable doc.

## Anti-patterns (of the gate itself)

- ❌ **Do not promote out of caution** ("better to record it just in case"). A false constraint is worse than nothing (#5).
- ❌ **Do not confuse transient with durable.** The test is always "does it survive a fix to its cause?".
- ❌ **Do not treat every error as a gotcha.** A recognized error goes to the CRITIC loop (`remediate`), which applies this filter.
