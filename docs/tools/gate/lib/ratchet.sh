#!/usr/bin/env bash
# Ratchet — a budget of violations per rule and region, monotonically decreasing.
#
# It exists because turning a hard rule on in a repository that already breaks it makes the
# gate start red, and a gate that is red on day 1 is disabled on day 2. The ratchet lets the
# pre-existing debt through and fails the GROWTH.
#
# Format of the ratchet TSV (header plus rows):
#   rule	region	count	note
#   21	.	0	no debt — the rule was born clean
#   34	src/legacy	4	pre-existing when the gate was turned on
#
# `region` is a path relative to the repository root; `.` covers the whole repository. A finding
# counts against the MOST SPECIFIC CONFIGURED region that prefixes its path. That is what lets
# you turn a rule on only where it is already clean, without a per-file exception list.
#
# Sourceable, not executable: `. "${AFM_GATE_LIB}/ratchet.sh"`.

# ratchet_budget <rule> <region> -> prints the budget (0 when not registered).
# Absence means 0 on purpose: a new rule is born with zero tolerance, and debt exists only when
# somebody measured it and wrote it down. A permissive default would be the door to a phantom gate.
ratchet_budget() {
  local rule="$1" region="$2" f="${RATCHET:-}"
  [ -n "$f" ] && [ -f "$f" ] || { printf '0'; return 0; }
  # A value bash cannot compare is malformed, not a budget. The TSV is written by hand, and an
  # all-digit number beyond the 64-bit range survives awk (printed back as 100000000000000000000)
  # and then breaks `[ -le ]` itself with "integer expression expected" — which evaluates falsy,
  # so the finding counts as over budget and stderr fills up on every run. Over 9 digits is far
  # beyond any debt anyone measured and far below where the comparison breaks; treat it as 0,
  # the same answer an unregistered rule gets, because a budget nobody can read is a budget
  # nobody measured.
  awk -F'\t' -v r="$rule" -v g="$region" '
    NR>1 && $1==r && $2==g {
      v = $3 + 0
      if (v < 0 || v > 999999999) v = 0
      printf "%d", v; found=1; exit
    }
    END { if (!found) print 0 }
  ' "$f"
}

# ratchet_region <rule> <path> -> prints the most specific configured region that prefixes
# <path>, or "." when none matches.
ratchet_region() {
  local rule="$1" path="$2" f="${RATCHET:-}"
  [ -n "$f" ] && [ -f "$f" ] || { printf '.'; return 0; }
  awk -F'\t' -v r="$rule" -v p="$path" '
    # An `exempt` row is a SCOPE statement, not a budget. Letting it act as a region made it
    # absorb every finding under that path into a budget of 0, so the rule failed there instead
    # of skipping it — the exemption turned into its opposite.
    NR>1 && $1==r && $2!="." && tolower($3)!="exempt" {
      # `index()==1` is a literal prefix. No regex, because a path holding "." or "+" would
      # turn into a metacharacter and match the wrong region in silence.
      #
      # A region is a PATH, so the prefix must end at a path boundary. Without that check,
      # `docs/research-extra/x.md` starts with the characters of `docs/research` and spent the
      # the neighbouring budget — a budget that absorbs a directory nobody measured stops meaning
      # anything, and it fails toward green. A trailing slash written by hand is tolerated.
      reg = $2
      sub(/\/+$/, "", reg)
      if (index(p, reg) == 1 \
          && (length(p) == length(reg) || substr(p, length(reg) + 1, 1) == "/") \
          && length(reg) > length(best)) best=reg
    }
    END { print (best == "" ? "." : best) }
  ' "$f"
}

# ratchet_note <rule> <region> -> the recorded reason for the debt (empty when there is none).
ratchet_note() {
  local rule="$1" region="$2" f="${RATCHET:-}"
  [ -n "$f" ] && [ -f "$f" ] || return 0
  awk -F'\t' -v r="$rule" -v g="$region" 'NR>1 && $1==r && $2==g { print $4; exit }' "$f"
}

# ratchet_has_rule <rule> -> exit 0 when the rule already has any row.
# `--baseline` uses it to refuse to touch a rule a human already decided about.
ratchet_has_rule() {
  local rule="$1" f="${RATCHET:-}"
  [ -n "$f" ] && [ -f "$f" ] || return 1
  awk -F'\t' -v r="$rule" 'NR>1 && $1==r { found=1; exit } END { exit !found }' "$f"
}

# ratchet_exempt <rule> <path> -> exit 0 when the path is OUT OF SCOPE for the rule.
#
# An exemption is not a budget, and conflating the two was the reason this function exists.
# A budget says "this many violations are tolerated here, and the number may only fall". An
# exemption says "this file is not what the rule is about at all" — the detector's own
# dictionary, a fixture written to be wrong on purpose, an archived changelog.
#
# Until 3.20.0 every exemption was a `case ... continue ;;` arm inside the runner, naming a
# path in ONE repository. That made the runner unshippable: a consumer inherited exclusions for
# files it does not have, and had nowhere to write its own. Worse, the exclusion was invisible —
# it lived in code nobody re-reads, while the ratchet is a versioned table a reviewer sees.
#
# Written as a row whose count column is the literal `exempt`:
#
#   rule	region	count	note
#   38	plugins/afm/framework-template/tools/afm-lang.sh	exempt	the accented alternation IS the detector
#   37	docs/legacy	exempt	vendored, not ours to rewrite
#
# `region` is a path prefix that must end at a path boundary — the same rule `ratchet_region`
# applies, and for the same reason: `docs/research-extra` must not spend `docs/research`'s row.
# A trailing `/*` is tolerated and means the same as the bare directory.
ratchet_exempt() {
  local rule="$1" path="$2" f="${RATCHET:-}"
  [ -n "$f" ] && [ -f "$f" ] || return 1
  awk -F'\t' -v r="$rule" -v p="$path" '
    NR>1 && $1==r && tolower($3)=="exempt" {
      reg = $2
      sub(/\/\*+$/, "", reg)
      sub(/\/+$/, "", reg)
      if (reg == "") next
      if (index(p, reg) == 1 \
          && (length(p) == length(reg) || substr(p, length(reg) + 1, 1) == "/")) { hit=1; exit }
    }
    END { exit !hit }
  ' "$f"
}
