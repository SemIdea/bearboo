#!/usr/bin/env bash
# Hard rule 38 — a Portuguese literal inside a script or inside a quoted marker.
#
# Why it exists: "the data was translated and the parser was not" was the MOST FREQUENT failure
# of the english-first migration, and NONE of the occurrences was caught by a gate. Three of
# them killed a mechanism in silence:
#
#   - afm-health.sh matched the Portuguese "superseded by ADR-" heading while the ADRs said
#     something else, so vital sign A4 (broken ADR chain) found zero, always.
#   - ops/restructure.md read the Portuguese bite and last-bite fields while the template wrote
#     `Bites:`/`last:`, so the dead-gotcha prune never found anything.
#   - guardrails/README.md documented the Portuguese key names while the files used `signal:`
#     and `trigger:`, so a new guardrail would be born invisible.
#
# The symptom never varies: the literal stays Portuguese and the target has already changed.
# Because the repo is english-first (rule 37), the HEURISTIC is cheap and precise — an accented
# word inside a `.sh`, or inside backticks in a plugin `.md`, is a candidate. It does not prove
# the drift; it points at where the drift lives. The human triages.
#
# It complements rule 37, which looks only at prose DENSITY in `.md` and is therefore blind both
# to `.sh` and to an isolated literal inside an English doc.
#
# Since 2026-08-27 `test/` is NO LONGER exempt. It used to be, by an explicit decision that the
# gates of this repo speak to the maintainer and are not distributed surface. Translating them
# found three dead mechanisms this exemption had been hiding for months — rule 34's check (a),
# the plugin-effect boundary in refs-lint, and the protocol assert in update-rehearsal — each one
# a parser left on a spelling nothing produces any more. The exemption was protecting exactly the
# files that most needed this rule.
set -u
MODE="${1:-staged}"; : "$MODE"   # COUNTING rule: the scope is the whole repo
REPO="${AFM_GATE_REPO:-$PWD}"
. "${AFM_GATE_LIB:?}/scope.sh"
. "${AFM_GATE_LIB:?}/ratchet.sh"

# LC_ALL=C: the [À-ÿ] range is INVALID outside a UTF-8 locale and makes grep abort.
# The prototype of this runner swallowed that error with 2>/dev/null and reported "0 findings"
# over a corpus with 6 known cases — a gate that swallows its own error is indistinguishable
# from one that passed, which is exactly the bug hunted here.
# Hence: an explicit alternation, no range, and the grep NEVER goes to /dev/null.
export LC_ALL=C
PT='ã|ç|õ|á|é|í|ó|ú|â|ê|ô|à|Ã|Ç|Õ|Á|É|Í|Ó|Ú|Â|Ê|Ô|À|ambos|planejada|gatilho|Gatilho'

RC=0
report() { printf '38\t%s\t%s\n' "$1" "$2"; RC=1; }

# --- 1. shell: any accented word (a comment included: it is instruction) ------
while IFS= read -r f; do
  [ -f "$REPO/$f" ] || continue
  # Exemptions live in the ratchet, never in this file. A `case` arm naming a path is an
  # exclusion that only one repository can have, invisible to any reviewer who does not read
  # the runner. See `ratchet_exempt` in `lib/ratchet.sh`.
  ratchet_exempt PLUGIN-38 "$f" && continue
  n=$(grep -cE "$PT" "$REPO/$f") || n=0
  [ "$n" -gt 0 ] && report "$f" "${n} line(s) with a Portuguese literal in a script"
done < <(scope_all '*.sh')

# --- 2. plugin markdown: a backticked literal (marker candidate) -------------
while IFS= read -r f; do
  [ -f "$REPO/$f" ] || continue
  # Exemptions live in the ratchet, never in this file. A `case` arm naming a path is an
  # exclusion that only one repository can have, invisible to any reviewer who does not read
  # the runner. See `ratchet_exempt` in `lib/ratchet.sh`.
  ratchet_exempt PLUGIN-38 "$f" && continue
  # These three are SHAPES that hold in any AFM instance, not paths one project happens to
  # have, so they stay in code: a changelog is a historical record; `core/afm.md` quotes a
  # Portuguese identifier as the example of what rule 21 forbids, and the example has to be
  # wrong to be an example; `ops/deliver.md` lists the override phrases, which are USER SPEECH.
  case "$f" in
    *CHANGELOG.md|*CHANGELOG-archive.md) continue ;;
    */core/afm.md|*/ops/deliver.md|*/ops/update.md) continue ;;
  esac
  # REAL backtick pairing: splitting on the backtick leaves the EVEN fields inside the code
  # span. A naive grep for a backtick, anything, a Portuguese word, anything, a backtick also
  # matches the SPACE BETWEEN two spans — that is how the first version reported a French loan
  # phrase as a Portuguese marker.
  n=$(awk -v pat="$PT" '
        { k=split($0, S, "`"); for (i=2; i<=k; i+=2) if (S[i] ~ pat) c++ }
        END { print c+0 }' "$REPO/$f")
  [ "$n" -gt 0 ] && report "$f" "${n} backticked Portuguese literal(s)"
done < <(scope_all 'plugins/*/**/*.md' 'plugins/*/*.md')

exit $RC
