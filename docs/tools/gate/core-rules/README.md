# Core rule runners — the ones the plugin ships

Every runner here enforces a rule about **the `docs/` instance that AFM materializes**, never
about a consumer's own code. That is why these travel and the ones in
[`../rules/`](../rules/README.md) do not.

| Runner | Rule |
| --- | --- |
| `PLUGIN-13-secrets.sh` | a token or a secret never leaks, the `docs/sessions/` narrative included |
| `PLUGIN-21-code-language.sh` | INALIENABLE — code and tests are written in English |
| `PLUGIN-35-gate-complete.sh` | a rule with a 0/1 trigger has a versioned runner in the gate |
| `PLUGIN-36-absolute-path.sh` | a doc under `docs/` carries no filesystem absolute path |
| `PLUGIN-37-prose-language.sh` | the prose of an artifact is English |
| `PLUGIN-38-parser-marker.sh` | a Portuguese literal never survives in a script or a quoted marker |
| `PLUGIN-39-frontmatter-ops.sh` | an indexed file carries the OKF contract |

## The namespace

The filename is `PLUGIN-<n>-<slug>.sh`, and `<n>` matches the `PLUGIN-<n>.` entry in
`docs/afm.md § 3`. The aggregator reads the whole `PLUGIN-<n>` as the rule ID, and `--audit`
cross-checks rule and runner in both directions inside each namespace.

A project runner with the SAME number wins over the shipped one, so a consumer overrides a core
rule by dropping `<n>-<slug>.sh` into `../rules/` — no fork of the plugin.

## Exemptions go in the ratchet, never in the runner

A runner here must not carry a `case ... continue ;;` arm that names a path. A path exists in one
repository; a shipped runner runs in all of them. Write the exemption as a ratchet row instead:

```
rule	region	count	note
PLUGIN-38	tools/lang-detector.sh	exempt	the accented alternation IS the detector
```

`exempt` is not a budget of zero. A budget says "this many violations are tolerated and the
number may only fall"; an exemption says "this file is not what the rule is about". The ratchet
also makes the exemption **visible**: it sits in a versioned table a reviewer reads, instead of
inside code nobody re-opens.

A **shape** that holds in every instance — an archived `CHANGELOG`, `core/afm.md` quoting a bad
identifier as the example of what rule PLUGIN-21 forbids — stays in the runner. It is not a path.

## Contract

Identical to a project runner. See [`../rules/README.md`](../rules/README.md). Two additions,
both learned the hard way on 2026-08-30:

- **Never derive the repository from `$0`.** Every runner used to run
  `REPO="$(cd "$(dirname "$0")/../.." && pwd)"`, which is only correct while the runner sits two
  levels below the root. The moment one shipped — five levels down — that expression pointed at
  `tools/`, and rule PLUGIN-37 reported "cannot be decided" against a file that was right there.
  Read `AFM_GATE_REPO`, which the aggregator exports.
- **Resolve a sibling tool through `$0`, not through a repository path.** The aggregator ships
  beside this directory in the plugin and in a materialized `docs/tools/gate/` alike.
