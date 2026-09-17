#!/usr/bin/env bash
# Hard rule 36 — a doc under docs/ carries no absolute path.
# A runbook holding a home directory of one user runs only on the machine of whoever wrote it,
# and the agent that reads it in a different clone either obeys the wrong path or hallucinates
# the correction. A relative path is what makes the markdown executable in any checkout.
#
# TWO exclusions, both structural and not "convenience":
#
# 1. `docs/sessions/` — the `cwd: <path>` line is LOAD-BEARING: afm-session-start.sh matches
#    the pending handoff with `grep -lF "cwd: $PWD"`. Without the absolute path the
#    cross-session handoff stops finding the right session. The directory also grows one entry
#    per session, so a ratchet (which only decreases) would be broken by design.
#
# 2. The pattern requires a segment AFTER the user name. Without that, a doc that *describes*
#    the trigger — this one — would accuse itself, and a rule that fails its own documentation
#    is the first one to be turned off.
set -u
MODE="${1:-staged}"; : "$MODE"   # COUNTING rule: the scope is the whole repo (see the gate lib scope.sh)
REPO="${AFM_GATE_REPO:-$PWD}"
. "${AFM_GATE_LIB:?}/scope.sh"
RC=0

while IFS= read -r f; do
  [ -f "$REPO/$f" ] || continue
  while IFS=: read -r n _; do
    printf '36\t%s:%s\tabsolute path in a doc (use a path relative to the repo root)\n' "$f" "$n"
    RC=1
  done < <(grep -nE '(^|[^A-Za-z0-9_])(/home/[A-Za-z0-9._-]+/|/Users/[A-Za-z0-9._-]+/|[A-Z]:\\\\[A-Za-z0-9._-]+)' "$REPO/$f")
done < <(scope_all 'docs/*.md' 'docs/**/*.md' | grep -v '^docs/sessions/')

exit $RC
