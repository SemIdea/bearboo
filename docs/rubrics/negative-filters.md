# Rubric — negative-filters (what NOT to promote to a durable doc)

> A **rejection** checklist at the entry gate of `gotcha`/`reconcile`/`remediate`. The negative face of principle #5 ("do not invent"): **a false constraint is poison** — worse than absence, because it hardens into a future refusal/error. v3.1.0+ (Phase 4 of the v3.2 initiative). Field evidence (ai-memory): in a real collection, ~28% of the pages were low-signal sessions that only polluted retrieval.

## Reject (does NOT become a gotcha/learning/rule/procedure)

| Anti-pattern | Why it is poison | What to do |
|---|---|---|
| **A negative claim about a tool** ("tool X is broken", "lib Y does not work") | It hardens into a **fossil refusal**: once the tool is fixed, the doc makes the next agent avoid it for no reason. | Record the concrete *workaround* (if durable), not the "it is broken" verdict. It disappears when the cause is fixed → transient. |
| **A transient failure** (resolved on the §5.1 retry, a credential/binary missing at the moment, setup state) | It becomes a **dead constraint**: the condition no longer exists; the doc lies to the future. | It stays as evidence in `.afm-log-failures/`, not an artifact. Capture the *retry/fix pattern*, not the temporary failure. |
| **A one-off narrative** ("in this session I did A, B, C") | The chronology already lives in `docs/.afm-log/`/`sessions/`; as a normative doc it is noise. | An episodic handoff (`sessions/`), not a semantic doc. |
| **A user-visible status** ("the build is passing now", "deploy ok") | Momentary state, not knowledge. | `_focus.md` (state) or a handoff, not a `gotcha`/`adr`. |
| **A release marker / smoke test** ("v0.1.1 published", "echo ok") | Operational, not a reusable lesson. | `notes`/log, never a rule/gotcha. |
| **A vibe-rule with no trigger** (KISS, DRY as a "rule") | Without an executable 0/1 trigger it is not a hard rule (#3). | A principle in `afm.md § 1.3`, not § 3. |

## Promotion test (passes the gate IF)

1. **Does it have a durable antidote?** (a concrete preventing action, not a verdict.)
2. **Does the claim survive the fix of the cause?** (if "it disappears when they fix X", it is transient → reject.)
3. **Does another agent without my memory need to know it to not break things?** (#1 — otherwise it is memory/state, not a doc.)
4. **Did it recur ≥2× OR is it a user correction OR an external SDK doc?** (#5 — otherwise it is evidence, not yet an artifact.)

Four **yes** → promote. Any structural **no** → it stays evidence/state, not a durable doc.

## Anti-patterns (of the gate itself)

- ❌ **Promoting as a precaution** ("better to record it just in case"). A false constraint is worse than empty (#5).
- ❌ **Confusing transient with durable** — the oracle is "does it survive the fix of the cause?".
- ❌ **Treating every error as a gotcha** — a recognized error goes to the CRITIC loop (`remediate`), which applies this filter.
