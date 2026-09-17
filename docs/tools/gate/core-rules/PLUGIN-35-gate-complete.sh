#!/usr/bin/env bash
# Hard rule 35 — a rule with a 0/1 trigger has a versioned runner and sits in the gate.
# It is the rule that stops the gate from rotting: without it, someone adds a rule with a
# verification written in prose and the document goes back to promising what nobody runs.
set -u
: "${1:-staged}"   # the rule is about the STRUCTURE of the gate, not about the diff
# The aggregator ships BESIDE this runner, in the plugin and in a materialized `docs/tools/gate/`
# alike, so `$0` resolves it in both. Until 3.20.0 this line read `$REPO/test/guardrails.sh` —
# one repository's path, hardcoded in a file meant to travel.
GATE="$(cd "$(dirname "$0")/.." && pwd)/guardrails.sh"
[ -x "$GATE" ] || { printf 'PLUGIN-35\tdocs/afm.md\tthe aggregator is not beside this runner at %s\n' "$GATE"; exit 2; }

OUT="$("$GATE" --repo "${AFM_GATE_REPO:-$PWD}" --audit 2>&1)"; RC=$?
[ "$RC" = 0 ] && exit 0

printf '%s\n' "$OUT" | grep -E '^  FAIL' | sed 's/^  FAIL — //' | while IFS= read -r l; do
  printf 'PLUGIN-35\tdocs/afm.md\t%s\n' "$l"
done
exit 1
