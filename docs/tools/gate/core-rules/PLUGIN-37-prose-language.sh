#!/usr/bin/env bash
# Hard rule 37 — the prose of an artifact is English.
#
# It complements rule 21, which covers only an IDENTIFIER and a TEST NAME carrying a
# non-ASCII character. Rule 21 is blind to prose: a `.md` written entirely in Portuguese
# passes it clean, and that is exactly how this repo reached 2026-08 with 175 Portuguese
# doc files while the gate reported green.
#
# The measurement itself lives in `framework-template/tools/afm-lang.sh` and NOT here.
# Rule 34: one canonical source. The same threshold has to decide at `PreToolUse`, where
# the text is still a proposal, and at commit, where it is already a fact — two copies of
# a measured threshold drift apart in silence, and the commit gate would then contradict
# the hook that had just approved the write.
set -u
MODE="${1:-staged}"; : "$MODE"   # COUNTING rule: the scope is the whole repo
REPO="${AFM_GATE_REPO:-$PWD}"
. "${AFM_GATE_LIB:?}/scope.sh"
. "${AFM_GATE_LIB:?}/ratchet.sh"

LANG_TOOL="$REPO/plugins/afm/framework-template/tools/afm-lang.sh"
if [ ! -x "$LANG_TOOL" ]; then
  printf 'PLUGIN-37\t%s\tthe language tool is missing or not executable — rule 37 cannot be decided\n' \
    "plugins/afm/framework-template/tools/afm-lang.sh"
  exit 1
fi

RC=0
while IFS= read -r f; do
  [ -f "$REPO/$f" ] || continue
  # Exemptions live in the ratchet, never in this file. A `case` arm naming a path is an
  # exclusion that only one repository can have, invisible to any reviewer who does not read
  # the runner. See `ratchet_exempt` in `lib/ratchet.sh`.
  ratchet_exempt PLUGIN-37 "$f" && continue
  # An archived CHANGELOG is a frozen historical record everywhere, not a per-project choice,
  # so it stays in code: it is a SHAPE, not a path.
  case "$f" in */CHANGELOG-archive.md) continue ;; esac
  D="$("$LANG_TOOL" --density "$REPO/$f" 2>/dev/null)" || continue
  # Exit 1 is the accusation; exit 2 is "too short to be a ratio" and has to read as a pass.
  # Collapsing the two reported 83 extra files on the first run of this delegation — every
  # short eval fixture — because `if ! cmd` cannot tell an accusation from an abstention.
  "$LANG_TOOL" --verdict --path "$f" "$REPO/$f" >/dev/null 2>&1; V=$?
  if [ "$V" -eq 1 ]; then
    printf '37\t%s\tPortuguese prose (density %s, %s hits in %s words)\n' \
      "$f" "$(printf '%s' "$D" | cut -f3)" "$(printf '%s' "$D" | cut -f2)" "$(printf '%s' "$D" | cut -f1)"
    RC=1
  fi
done < <(scope_all '*.md')

exit $RC
