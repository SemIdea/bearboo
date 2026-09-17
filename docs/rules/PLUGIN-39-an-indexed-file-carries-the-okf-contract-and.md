---
type: rule
description: 'An indexed file carries the OKF contract, and an op declares what it writes and composes'
load: warm
rule_number: PLUGIN-39
fires_on: event
fires_when: 'An indexed file carries the OKF contract, and an op declares what it writes and composes'
---

# Hard rule PLUGIN-39 — An indexed file carries the OKF contract, and an op declares what it writes and composes

# Hard rule PLUGIN-39 — An indexed file carries the OKF contract, and an op declares what it writes and composes.

    The contract is three keys. `type:` is the one key OKF v0.2 requires. `description:` is one sentence, and the index prints it instead of opening the body. `load:` is `hot`, `warm` or `cold`, and it tells the index what to skip. `tools/afm-index.sh` reads frontmatter and nothing else. A file without it is invisible to the index. The agent asks who writes `spec.md`, gets a list with that file missing, and receives no signal. Missing metadata does not look like an error. It looks like a shorter list. A `composes:` that names a dead op fails from the other side. The reader trusts it because the frontmatter is the cheap thing it read instead of the body.

    **`description:` reverses an earlier decision, and the trade is named.** Until 3.9.0 this rule refused a `summary:` key. The reason was sound. Every other key is a property of the file, so no edit to the body can make the frontmatter false. A summary is a derived duplicate, and it goes stale in silence.

    The objection stands, and this rule accepts it. It buys one thing. Without a stated description the index cannot say what a file is without opening it. That read is the cost the whole retrieval layer exists to remove.

    Two facts limit the damage. A description states the purpose of the file, which changes at rename scale, not at edit scale. This repository also accepts the same trade elsewhere. `refs-lint.sh` demands a `> **In this file:**` line in every reference file over 100 lines, and nothing gates its truth. The key is `description`, not `summary`, because OKF v0.2 names it and index generators read it.

    *Verification (pre-commit):* [`test/rules/39-frontmatter-ops.sh`](../../test/rules/39-frontmatter-ops.sh). Pass 1 checks `type:`, `description:` and `load:` across every directory the index reads, and rejects the retired `kind:`. Pass 2 checks `writes:` and `composes:` on the ops, and resolves each `composes:` to a real file. The directory list must stay in sync with `INDEXED` in the index itself — a directory the index reads and the gate does not check is where frontmatter goes missing silently.
