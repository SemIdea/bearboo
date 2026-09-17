#!/usr/bin/env bash
# Hard rule 21 (INALIENABLE) — code and tests are written in English.
# The trigger covers an identifier and a test name with a non-ASCII character. It does NOT
# cover unaccented Portuguese (an identifier without a diacritic passes) and it does not cover
# a comment — English prose uses em dashes and curly quotes, so non-ASCII inside a comment is
# noise, not signal. Since 3.9.0-rc.1 the comment is covered from the other side, by density,
# in `tools/afm-lang.sh`.
set -u
MODE="${1:-staged}"; : "$MODE"   # COUNTING rule: the scope is the whole repo (see the gate lib scope.sh)
REPO="${AFM_GATE_REPO:-$PWD}"
. "${AFM_GATE_LIB:?}/scope.sh"

# `grep -P` is GNU. Without it the runner does NOT decide — and an abstention never becomes a
# failure, or the first machine without GNU grep turns the gate into a permanent block.
echo x | grep -qP 'x' 2>/dev/null || exit 2

RC=0
PAT='\b(?:function|class|const|let|var|def|interface|type|enum|describe|it|test)\b\s*\(?\s*["\x27]?[A-Za-z_$][\w$ ]*[^\x00-\x7F]'
while IFS= read -r f; do
  [ -f "$REPO/$f" ] || continue
  while IFS=: read -r n _; do
    printf '21\t%s:%s\tidentifier or test name with a non-ASCII character\n' "$f" "$n"
    RC=1
  done < <(grep -nP "$PAT" "$REPO/$f" 2>/dev/null)
done < <(scope_all 'plugins/*/mcp/src/*')

exit $RC
