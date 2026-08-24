# Rubric — failure classification (mechanical → procedure | conceptual → learning | transient → nothing)

> Used by the CRITIC loop (`ops/remediate.md`) when remediating a recognized failure recorded in `docs/.afm-log-failures/`. The discriminator is **executable**, not a "feeling". Ancestor: CRITIC (arXiv 2305.11738) — failure recognition ONLY by an external signal; self-critique without a tool degrades (PRINCIPLES #3).

## Prerequisite (entry gate — common to all three)

The failure **only exists** if it was recognized by an **external signal**: a persistent red test (§5.1 cap spent), `tsc`/type-check ≠0, a step command ≠0, a hard rule violated after the fact (a trigger on the wrong side), OR **an explicit user correction**. "I think I got it wrong" is **not** a failure (CRITIC). Every failure becomes **a one-line file** in `docs/.afm-log-failures/YYYY-MM-DD-<slug>.md` with `sig=<signature>` (the recurrence key).

## The three destinations

### Mechanical → `docs/procedures/<slug>.md`

**Iff all three:** (1) it is a **repeatable step sequence** with 0/1 gates per step; (2) it recurred — `grep -lc "sig=<hash>" docs/.afm-log-failures/*.md` ≥ 2 (**OR** an explicit user correction, which counts as 1 — the user is the oracle); (3) it has a **mechanical start trigger** ("when X, run this runbook").
*Example:* "the build breaks with `type:module` in tsdown" recurred → a runbook "when you touch the emit, do A→B→C, verify 0/1".

### Conceptual → `docs/learnings/<slug>.md`

**Iff:** the value is in the **cause** (a counterintuitive lesson), not in a mechanical step sequence. The same promotion gate (1 user correction OR ≥2× mechanical). Carries a `**Gatilho:**` by path → `afm-pre-edit.sh` injects it into whoever edits the area.
*Example:* "I assumed the webhook arrives 1×; it arrives 2× — always handle it idempotently" → a learning with a `webhook` trigger.

### Transient → nothing (stays only as evidence in the log)

**Iff:** resolved on the §5.1 retry (did not cross the terminal), OR with no durable antidote, OR the claim **does not survive the fix of the cause** ("tool X is broken" hardens into a future refusal once the tool is fixed — negative-filter). It stays as a line in `.afm-log-failures/`, does **not** become an artifact. It is #5 (do not invent a constraint without a durable case) and the Phase 4 negative-filter.

## Decision flow

```
Failure recognized by an external signal? ── no → NOT a failure (CRITIC). Stop.
   │ yes
   ▼
Record in docs/.afm-log-failures/ (sig=).
   │
Resolved on the §5.1 retry / no durable antidote / claim dies when the cause is fixed?
   ├── yes → TRANSIENT: stays evidence, does not promote.
   └── no
        │
   1 user correction OR sig= recurred ≥2×?
        ├── no → still just evidence (awaits recurrence).
        └── yes
             │
        A repeatable step sequence with 0/1 gates + a start trigger?
             ├── yes → PROCEDURE (docs/procedures/)
             └── no → LEARNING  (docs/learnings/)
```

## Anti-patterns

- ❌ **Recognizing a failure by self-judgment** (no external signal). CRITIC: it degrades.
- ❌ **Promoting a single mechanical failure** to an artifact (becomes noise/a dead constraint). Only ≥2× — except a user correction (1 is enough).
- ❌ **Promoting a transient failure** resolved on §5.1. It never reaches the terminal; it is not recorded as a failure.
- ❌ **Throwing everything into `procedures/`** (a procedure is a *mechanical sequence*; a conceptual lesson is a `learning`) or **everything into `learnings/`** (a repeatable runbook is a `procedure`).
- ❌ **A procedure/learning that does not cite the origin `sig=`** (traceability — hard rule 19 / R3).
