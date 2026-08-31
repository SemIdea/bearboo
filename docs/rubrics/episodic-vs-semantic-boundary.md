# Rubric — the episodic vs semantic boundary (what decays vs what is permanent)

> Materializes invariant principle #1 ("if another agent without my memory needs to know it, it is a doc") on the **temporal** dimension: not every `/docs/` artifact is permanent knowledge. v3.1.0+ (Phase 3 of the v3.2 initiative). Ancestor: CoALA (arXiv 2309.02427) — **episodic** memory (what happened) ≠ **semantic** (what is known) ≠ **procedural** (how it is done).

## The tiers in AFM

| Tier | What it is | Where it lives | Decays? | Enters the diagnose axes A1–A7? |
|---|---|---|---|---|
| **Semantic** | durable knowledge: rules, architecture, decisions, surprises | `afm.md`, `ach.md`, `prd.md`, `ust.md`, `gotchas.md`, `adr/`, `learnings/`, `rubrics/` | **No** — supersedable (a Superseded ADR, a tombstone), never deleted | **Yes** |
| **Procedural** | repeatable sequences | `procedures/` | frequency/staleness (`restructure`) | Yes (inherited coverage) |
| **Episodic** | what happened in a session: work state, handoff | `sessions/` (handoff), `_focus.md` (current focus) | **Yes** — an aged `open` handoff decays (A2); `_focus` is OVERWRITE | **NO** (it is state, not knowledge) |
| **Telemetry** | an append-only log of events/failures | `.afm-log/`, `.afm-log-failures/` | only by rotation/retention; audit = git | **NO** (append-only) |

## Criterion (decision)

- **Is it knowledge that another agent without my memory needs to not break things?** → **semantic** (permanent, enters the diagnose, never decays on its own). It is #1.
- **Is it "where I was" / "what happened in this session"?** → **episodic** (decays, stays out of the diagnose). Giving it permanence inflates the diagnose with noise.
- **Episodic → semantic promotion** is the point of `reconcile`: when an episode reveals a load-bearing decision/rule/gotcha, propose materializing it in the semantic tier (a human gate, #6). The episode is the **buffer** from which evolution fishes candidates; it is not the evolution.

## Anti-patterns

- ❌ **Treating a handoff/`_focus` as a normative doc** — inflates the diagnose (A1–A7) with volatile state. They are episodic.
- ❌ **Decaying semantic knowledge** — a rule/decision/gotcha does not decay by age; it is superseded (an ADR) or consolidated (`generalize`), never deleted by time (#5: institutional memory).
- ❌ **A growing `_focus.md`** — it is small, overwritten state (rule 20), not a log.
- ❌ **Promoting an episode to semantic without crossing #1** — not every "what happened" is "what another needs to know".
