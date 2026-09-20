#!/usr/bin/env bash
# Hard rule 13 — a token or a secret never leaks, the docs/sessions/ narrative included.
# It is a gate because it is the cheapest error to make (the agent quotes the command it ran,
# and the command carried the key) and the most expensive to undo: a committed secret is a
# rotated secret.
set -u
MODE="${1:-staged}"
REPO="${AFM_GATE_REPO:-$PWD}"
. "${AFM_GATE_LIB:?}/scope.sh"
RC=0

# A secret in the ADDED lines. The awk tracks the current `+++ b/<file>` because "diff:7"
# locates no leak at all — and locating it fast is the point: a committed secret is a rotated
# secret, and the rotation starts by knowing which file to open.
scan() {
  scope_diff "$MODE" | awk -v pat="$1" -v msg="$2" '
    /^\+\+\+ b\// { f = substr($0, 7); next }
    /^\+/ && $0 ~ pat { printf "13\t%s\t%s\n", (f == "" ? "(index)" : f), msg }
  '
}

OUT="$(scan "(token|secret|api[_-]?key|password|bearer)[[:space:]]*[:=][[:space:]]*[\"'"'"'][^\"'"'"']+" "key/value pair with a plaintext secret")
$(scan "(sk-[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_-]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]{20,}[.])" "token in a recognizable format (sk-/ghp_/AIza/xox/JWT)")"
if printf '%s' "$OUT" | grep -q .; then
  printf '%s\n' "$OUT" | grep -v '^$'
  RC=1
fi

# A versioned .env. `.env.example` is legitimate and stays out.
while IFS= read -r f; do
  case "$f" in *.env.example|*.env.sample) continue ;; esac
  printf '13\t%s\ta .env file must not be versioned\n' "$f"
  RC=1
done < <(scope_files "$MODE" | grep -E '(^|/)\.env')

exit $RC
