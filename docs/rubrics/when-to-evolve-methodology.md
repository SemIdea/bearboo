# Rubric — the evolution cycle (`evolve`) vs a single mechanism vs a point fix

> **What "evolution" means here:** refining **this project's local documentation** (the materialized instance of the methodology in `<consumer>/docs/`) — making it leaner, clearer, more current, and more efficient. **Never** the AFM plugin itself (`framework-template/`); to the plugin, you only **suggest** via `/afm:promote`. Every mention of "methodology"/"methodology health" below is the local doc.

> A **3-way** decision: does what appeared call for (1) the **whole cycle** of `/afm:evolve` (orchestrator: evidence collection → proposal → single gate → application → record), (2) **a single à-la-carte mechanism** (`/afm:diagnose`, `/afm:reflect`, `/afm:generalize`, `/afm:restructure`), or (3) **a point fix** that `reconcile` proposes directly via an atomic skill (`/afm:gotcha`, `/afm:rule`, `/afm:adr`)? Decreasing cost: the cycle is the most expensive (composes several mechanisms, a consolidated gate, a record in `docs/evolution/`); the single mechanism is scoped; the point fix is cheap. Do not run the cycle for what fits a mechanism, nor a mechanism for what fits an edit.

## The 3 ways

### 1. The `evolve` cycle — when BOTH are true:

- ✅ **The problem is the instance as a whole, not an isolated axis** — several health findings, or findings that cross modalities (dead refs **and** a lived ambiguous rule **and** scattered inflation). It is a *health sweep* that benefits from a consolidated gate + lineage in one place.
- ✅ **There is observable evidence of "off 100%"** — a mechanical signal (from `diagnose`) OR a behavioral one (from `reflect`) OR a symptom the user articulates ("the docs are a mess"). Without a signal, do not run it (a healthy instance → the cycle yields ~zero; the cooldown refuses).

### 2. A single à-la-carte mechanism — when you know exactly which lens you need:

- 🔍 **`/afm:diagnose`** — only the **health report** (a mechanical scan of the 7 axes, read-only). "How is the methodology health here?" without wanting to propose/apply anything.
- 🪞 **`/afm:reflect`** — **a specific doc guided badly** at apply-time (an ambiguous rule, a section that did not guide). Instructiveness refinement, behavioral evidence from the session.
- 🧬 **`/afm:generalize`** — **≥2 similar gotchas** accumulated and call for fusion into an abstract rule (episodic→semantic). Anti-inflation at the root.
- 🗂️ **`/afm:restructure`** — **staleness** (a doc outdated vs the code) or **findability/partition** (badly located info, a doc that scaled).

> The single mechanism still **self-verifies and gates** what it proposes (reflect/generalize/restructure have their own gate; diagnose is read-only). The difference from the cycle is the **scope**: one lens, not the sweep; without the overhead of composing all + a cycle record.

### 3. A point fix (reconcile → atomic skill) — when it is additive and local:

- ❌ **You learned a NEW fact/decision/gotcha** — `/afm:adr` (an architectural decision), `/afm:rule` (a rule from a correction), `/afm:gotcha` (a surprise that bit 2×). `reconcile` already covers this at the end of the turn; opening a mechanism/cycle is overhead. (Distinction: `reconcile`/`gotcha`/`rule` **add** knowledge; `reflect`/`generalize`/`restructure` **refine/consolidate/reorganize** what already exists.)
- ❌ **Validating ONE feature** — coverage/consistency spec↔plan↔tasks → `/afm:analyze` (read-only, per-feature).
- ❌ **A feature delivery** → `/afm:deliver`.
- ❌ **Promoting a learning to the plugin** → `/afm:promote`.

## Why these rules

- **An observable signal is mandatory** (ways 1 and 2). A systemic problem without evidence turns the agent into auditing text based on text (a self-reference loop) — forbidden. Mechanical (`diagnose`) and behavioral (`reflect`) are the two modalities of evidence (the two sides of the Self-Harness φ); both count.
- **Signal > ritual** (Self-Harness / Autogenesis): on healthy docs the cycle yields almost nothing. An adaptive trigger by evidence beats a fixed budget/calendar. The `evolve` cooldown refuses a cycle with no new signal (the single mechanism, being scoped and — for diagnose — read-only, has no cooldown).
- **Scope decides the way** (cycle vs mechanism): if you know the lens, use the mechanism; if it is a multi-modality sweep that deserves a consolidated gate, use the cycle. Do not compose all the mechanisms (evolve) to solve a single axis.
- **An empty diagnosis is a valid result**: if the scan/reflection finds nothing, report "100%" and close — do **not** fabricate a disease to justify the invocation.
- **Doc size is a signal of consolidation, never of pruning** (ACE × Configuring): a core doc above ~500 lines (`afm-health.sh` A6 soft tier) routes to a **consolidation review** — `/afm:generalize` (merges redundancy) or `/afm:restructure` (partitions by temperature) — **never** a cut by size. ACE: prune redundancy, not a line; a brevity bias throws away load-bearing detail. The number is a review trigger, not a deletion verdict.

## Anti-examples

- ❌ **Running `/afm:evolve` weekly by ritual** — run by signal, not by calendar.
- ❌ **Opening the cycle to record a new gotcha** — it is additive and local; `/afm:gotcha` (or reconcile proposing it) solves it.
- ❌ **Running the whole cycle just to see the health** — that is `/afm:diagnose` (read-only, no gate).
- ❌ **A finding "the doc looks inflated" with no `wc -l`/duplicate grep** — with no observable evidence it is not a finding (#5).
- ❌ **`generalize` from 1 gotcha** — with no batch (≥2) there is no generalization; it is fabricating an abstraction with no evidence.
- ❌ **`reflect` softening a rule because it constrained me** — a violation ≠ a wrong rule; "the agent is non-compliant" is a mandatory rival hypothesis.
- ❌ **`restructure` forcing tiering on a small doc** — partition by temperature is opt-in, only when the doc scaled (YAGNI).
- ❌ **Running it again with nothing changed** — the cooldown (in the cycle); a mechanism with no new signal is theater.
