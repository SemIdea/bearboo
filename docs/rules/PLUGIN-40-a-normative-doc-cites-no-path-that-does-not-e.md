---
type: rule
description: 'A normative doc cites no path that does not exist'
load: warm
rule_number: PLUGIN-40
fires_on: event
fires_when: 'A normative doc cites no path that does not exist'
---

# Hard rule PLUGIN-40 — A normative doc cites no path that does not exist

# Hard rule PLUGIN-40 — A normative doc cites no path that does not exist

    A rename is finished when the **writers** and the **readers** both move. The sentence was already
    written in this repository, in `docs/_focus.md` and in a gotcha, and on 2026-08-30 it failed twice
    inside the release that exists because of it. First a runner glob kept matching only the old name
    shape, so a whole directory of runners went invisible while the gate reported green. Then seven
    rule files kept showing a label that pointed at files which had just moved.

    `afm-health.sh` **detected** the second one and reported it at SessionStart. It was read, and the
    work continued. Detection at the start of a session and refusal at the commit are not the same
    event, and only the second one arrives while the change is still in the hands of whoever made it.

    **Scope: the normative families only** — `afm.md`, `ach.md`, `prd.md`, `ust.md`, `_focus.md`, and
    `adr/`, `rules/`, `gotchas/`, `learnings/`, `guardrails/`, `procedures/`. A rubric teaches with an
    illustrative path, a research dossier quotes a hypothetical one, and a feature's `tasks.md` names
    paths as they were the day it was written. Aiming the gate at those produced 44 findings that were
    all correct notation. A gate that starts red is switched off the next day, and it takes every
    other rule in the same aggregator with it.

    **A cited path resolves from the repository root OR from the directory of the file that cites it.**
    Both conventions are alive in a real instance. A checker that knows only one invents findings —
    which is the same way a gate gets switched off, arrived at from the other side.

    Not a violation: a line that announces a removal (an ADR's job is to cite what stopped existing),
    a placeholder shape (`features/NNN/spec.md`, `rules/NN-slug.md`, `YYYY-MM.md`), a dot-dir path
    (`.seo/config.json` is the notation for a materialized instance), and `/docs/x.md`, which is AFM's
    notation for the consumer's directory and not an absolute path.

    A citation that is deliberately historical goes in the ratchet, with the reason. Three rows exist
    today for exactly that: two ADRs and one user story that quote a path **because** it stopped
    existing, which is the point each of them is making.

    *Verification (pre-commit):* [`plugins/afm/framework-template/tools/gate/core-rules/PLUGIN-40-dead-reference.sh`](../../plugins/afm/framework-template/tools/gate/core-rules/PLUGIN-40-dead-reference.sh) — for every backticked path in a normative doc, `test -e` from the repository root and from the citing file's directory, then a `git ls-files` fallback. **The fallback matches by SUFFIX**, so a path written relative to a component root is accepted while the tracked file sits further up the tree. That is deliberate — a doc that names a path relative to a component root is not lying — but it means the rule proves the file EXISTS somewhere, not that the label leads a reader to it. Seven labels passed this way on the day the rule was written, and were made explicit by hand. Exit 1 on any finding; the aggregator decides against the ratchet.

> **Two namespaces, and no reserved number range (3.20.0).** A rule the plugin ships is
> `PLUGIN-<n>` — it is the contract of the `docs/` that AFM materializes, and it arrives with
> its runner in `docs/tools/gate/core-rules/`. A rule THIS project writes about its own code is
> a plain `<n>`, and you may start at 1. The two namespaces never collide, so nothing has to be
> reserved. An organisation policy rule is numbered 100 or higher — a third namespace, see
> `/afm:policy`.
>
> Before 3.20.0 this block reserved 18-29 for "template universal rules, which grow with each
> release" and told a project to start at 30. A reservation is a promise about numbers that
> nobody can keep. The plugin's own repository had already spent 35-39 on rules that turned out
> to be universal, and the moment those shipped, any consumer's own rule 35 collided with them.

{{Add project-specific hard rules here, plain-numbered. Each one MUST have a mechanical trigger. Otherwise it goes to §1.3 as a principle.}}

---
