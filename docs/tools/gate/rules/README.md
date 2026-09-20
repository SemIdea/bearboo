# Rule runners — the PROJECT's own

This directory is **empty on purpose**, and since 3.20.0 that statement is narrower than it used
to be. Read [`../core-rules/README.md`](../core-rules/README.md) beside it.

There are **two classes of rule**, and conflating them was a real defect (ADR 0021).

A **project rule** is about this project's own CODE — a line limit, a layering constraint, a
naming convention. It belongs here, and the plugin ships none of them. The argument holds
exactly as it always did: a consumer that inherits a rule nobody chose bypasses it first.

An **artifact rule** is about the `docs/` that AFM itself materializes — English prose, no
absolute path, the OKF frontmatter contract, a versioned runner behind every 0/1 trigger.
Nobody "chooses" those. They are what an AFM instance IS, and they ship in `../core-rules/`
under the `PLUGIN-` namespace. Until 3.20.0 they existed only in the plugin's own repository,
so every consumer received an `afm.md` whose hard rules stopped at 21.

## Write one

Start from [`guardrail-runner.template.md`](../../../templates/guardrail-runner.template.md)
and follow [`ops/rule.md` § Install the gate](../../../ops/rule.md).

Name it `<NN>-<slug>.sh`, where `NN` is the rule number in `docs/afm.md` § 3. The aggregator
reads that number from the filename, and `--audit` uses it to cross-check the rule and the
runner in both directions. A runner whose number matches no rule is reported as an orphan.

## Contract

```
argv[1]          : "staged" | "worktree"
env RATCHET      : path of the ratchet TSV
env AFM_GATE_LIB : directory holding scope.sh and ratchet.sh
stdout           : one line per finding — "<NN>\t<path>[:<line>]\t<message>"
exit 0 compliant · 1 violated · 2 COULD NOT decide
```

Resolve the library through `AFM_GATE_LIB`, never through a fixed path:

```bash
. "${AFM_GATE_LIB:?}/scope.sh"
```

The runner does not know where the gate lives. That is what lets the same runner work in a
project that keeps the gate under `docs/tools/gate/` and in one that keeps it somewhere else.

## Before you turn a rule on

Run `guardrails.sh --baseline`. It measures HEAD and records what it finds as declared debt, so
the gate starts green in a repository that already breaks the rule. A gate that starts red is
disabled the next day, and it takes every other rule in the same aggregator with it.
