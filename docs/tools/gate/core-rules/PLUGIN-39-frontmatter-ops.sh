#!/usr/bin/env bash
# Hard rule 39 — every op carries frontmatter, and what it declares is true.
#
# A gate, not a preference, because the failure is SILENT in the way that matters: the
# index reads frontmatter and nothing else, so an op with none is simply invisible to it.
# The agent asks "who writes spec.md", gets an answer that omits the file it needed, and
# has no signal that anything was left out. Missing metadata does not look like an error.
# It looks like a shorter list.
#
# A dangling `composes:` fails the same way from the other side — it names an op that no
# longer exists, and the reader trusts it because the frontmatter is the cheap thing it
# read INSTEAD of the body.
set -u
# COUNTING rule: the scope is the whole repository, not the diff. Rule 36 declares the same, for
# the same reason — the question "is every indexed file readable" is about the TREE. A staged-only
# answer would report a bundle as conformant because this commit happened not to touch the broken
# file. The argument is accepted and deliberately unused.
MODE="${1:-worktree}"; : "$MODE"
REPO="${AFM_GATE_REPO:-$PWD}"
. "${AFM_GATE_LIB:?}/scope.sh"

FT="$REPO/plugins/afm/framework-template"
OPS="$FT/ops"
[ -d "$OPS" ] || exit 2

# Every directory the index reads. Keep in sync with `INDEXED` in tools/afm-index.sh: a
# directory the index reads but the gate does not check is a directory where frontmatter
# can silently go missing, and missing frontmatter is invisible by construction.
INDEXED="ops core rubrics templates templates/protocols interview"

RC=0

# Reads one frontmatter key. Same block definition the index uses: line 1 is `---`, the
# block ends at the next `---`.
fmkey() {
  awk -v k="$2" '
    NR == 1 { next }
    /^---[[:space:]]*$/ { exit }
    $0 ~ "^" k ":" { print; found = 1; exit }
    END { exit !found }
  ' "$1" 2>/dev/null
}

# Pass 0 — the frontmatter is PARSEABLE YAML with a non-empty `type`.
#
# This is clause 1 and clause 2 of OKF conformance (SPEC v0.2 11), and until 3.10.1 nothing
# checked either one. The repository declared conformance in ADR 0018 and had 59 files that no
# YAML parser could read: a `description: Session record: name` (a colon inside a plain scalar)
# and a `trigger_grep: "awk.*\."` (a backslash escape inside a double-quoted scalar) both parse
# fine to a grep and not at all to YAML.
#
# The whole point of a shared format is that a tool nobody here wrote can read the files. A
# grep-based reader hides exactly this class of break, because grep never parses.
#
# python3 is the parser. When it is absent the check SKIPS AUDIBLY, the same discipline the
# shellcheck skip follows: a silent skip is a gate that reports coverage it does not have.
if command -v python3 >/dev/null 2>&1; then
  YAML_OUT="$(python3 - "$REPO" <<'PYEOF' 2>/dev/null
import sys, os, glob
try:
    import yaml
except ImportError:
    sys.exit(3)
repo = sys.argv[1]
roots = ["docs/**/*.md", "plugins/afm/framework-template/**/*.md"]
for pat in roots:
    for p in glob.glob(os.path.join(repo, pat), recursive=True):
        if os.path.basename(p) in ("index.md", "log.md", "README.md"):
            continue
        s = open(p, encoding="utf-8", errors="replace").read()
        if not s.startswith("---\n"):
            continue
        end = s.find("\n---", 4)
        if end < 0:
            print("%s\tfrontmatter block never closes" % os.path.relpath(p, repo)); continue
        try:
            d = yaml.safe_load(s[4:end])
        except Exception as e:
            print("%s\tfrontmatter is not parseable YAML: %s" % (os.path.relpath(p, repo), str(e).split("\n")[0][:90])); continue
        if not isinstance(d, dict):
            print("%s\tfrontmatter is not a mapping" % os.path.relpath(p, repo)); continue
        if not d.get("type"):
            print("%s\tno non-empty `type:` (OKF requires exactly this one key)" % os.path.relpath(p, repo))
PYEOF
)"
  RCP=$?
  if [ "$RCP" = 3 ]; then
    # stderr, never stdout. The runner contract says one stdout line per FINDING, and the
    # aggregator counts them — so a skip printed there is reported as a rule 39 violation on
    # every machine without the module. An audible skip must be audible, not a false failure.
    printf 'note: rule 39 pass 0 SKIPPED — python3 has no yaml module, OKF clause 1 unchecked\n' >&2
  elif [ -n "$YAML_OUT" ]; then
    printf '%s\n' "$YAML_OUT" | while IFS="$(printf '\t')" read -r f m; do
      printf '39\t%s\t%s\n' "$f" "$m"
    done
    RC=1
  fi
else
  printf 'note: rule 39 pass 0 SKIPPED — no python3, OKF clause 1 unchecked\n' >&2
fi

# Pass 1 — every indexed file carries the OKF profile contract.
#
# `type` is the one key OKF requires (SPEC v0.2 4.1). It replaced `kind`, which said the same
# thing under a name no other tool knows. `description` is what the generated index prints
# INSTEAD of opening the body, so a file without one costs a full read to answer "what is this".
# `tier` is the AFM extension that tells the index what it may skip: a `cold` file is never
# loaded at run time, and the index must not pay to open it.
#
# All three fail the same silent way. The index reads frontmatter and nothing else, so the file
# is not reported as broken. It is simply absent from the answer.
for d in $INDEXED; do
  [ -d "$FT/$d" ] || continue
  for f in "$FT/$d"/*.md; do
    [ -f "$f" ] || continue
    case "$(basename "$f")" in README.md|index.md|log.md) continue ;; esac
    rel="${f#"$REPO"/}"
    if [ "$(head -n1 "$f")" != "---" ]; then
      printf '39\t%s\tno frontmatter — invisible to the index\n' "$rel"
      RC=1
      continue
    fi
    if fmkey "$f" kind >/dev/null; then
      printf '39\t%s\t`kind:` is the retired name — OKF requires `type:`\n' "$rel"
      RC=1
    fi
    fmkey "$f" type >/dev/null || {
      printf '39\t%s\tfrontmatter has no `type:` — the one key OKF requires\n' "$rel"; RC=1; }
    fmkey "$f" description >/dev/null || {
      printf '39\t%s\tno `description:` — the index would have to open the body\n' "$rel"; RC=1; }
    load="$(fmkey "$f" load | sed 's/^load:[[:space:]]*//')"
    case "$load" in
      hot|warm|cold) ;;
      "") printf '39\t%s\tno `load:` — the index cannot know what to skip\n' "$rel"; RC=1 ;;
      *)  printf '39\t%s\t`load: %s` outside the closed vocabulary (hot|warm|cold)\n' "$rel" "$load"; RC=1 ;;
    esac
  done
done

# Pass 1b — a rubric declares HOW it fires and WHAT it says.
#
# Same failure as a missing `kind:`, one family over: `afm-index.sh --triggers` and
# `afm-detect.sh` both read frontmatter and nothing else, so a rubric without `fires_on` is
# invisible to the index and never fires at write time. The reader gets a shorter list and no
# signal that anything was left out. A rubric that nothing can trigger is a document nobody
# will ever be pointed at, which is the exact condition this whole line of releases exists to
# remove.
RUBRICS="$FT/rubrics"
if [ -d "$RUBRICS" ]; then
  for f in "$RUBRICS"/*.md; do
    [ -f "$f" ] || continue
    case "$(basename "$f")" in README.md|index.md|log.md) continue ;; esac
    rel="${f#"$REPO"/}"
    [ "$(head -n1 "$f")" = "---" ] || continue   # pass 1 already reported this
    fo="$(fmkey "$f" fires_on)"
    if [ -z "$fo" ]; then
      printf '39\t%s\trubric with no `fires_on:` — invisible to the index and never fires\n' "$rel"
      RC=1
      continue
    fi
    case "$fo" in
      *file-shape|*repo-shape|*op-call|*event|*cadence) ;;
      *) printf '39\t%s\t`fires_on:` outside the closed vocabulary (file-shape|repo-shape|op-call|event|cadence)\n' "$rel"; RC=1 ;;
    esac
    fmkey "$f" fires_when >/dev/null || {
      printf '39\t%s\trubric with no `fires_when:` — nothing to name when it fires\n' "$rel"; RC=1; }
  done
fi

# Pass 1c — a procedure and a learning declare when they start.
#
# Not to make them FIRE — an `event` trigger cannot fire and is not supposed to. To make them
# DISCOVERABLE: the condition that starts a runbook used to live in a `When to run it` bullet
# inside the body, so answering "is there a runbook for this?" meant opening every file in the
# family. One line in the index answers it instead. This repository reached 2026-08 with 26
# gotchas and 3 procedures, and the family that nobody creates is the family nobody can find.
#
# An `event` or `cadence` entry must carry NO `trigger_*` key. Fabricating a mechanical field
# for a human judgment is the failure this vocabulary exists to prevent: it would dilute the
# confidence that rubrics and guardrails earned by being genuinely mechanical.
for d in docs/procedures docs/learnings; do
  [ -d "$REPO/$d" ] || continue
  for f in "$REPO/$d"/*.md; do
    [ -f "$f" ] || continue
    case "$(basename "$f")" in README.md|index.md|log.md) continue ;; esac
    rel="${f#"$REPO"/}"
    if [ "$(head -n1 "$f")" != "---" ]; then
      printf '39\t%s\tno frontmatter — invisible to the trigger index\n' "$rel"; RC=1; continue
    fi
    fo="$(fmkey "$f" fires_on)"
    [ -n "$fo" ] || { printf '39\t%s\tno `fires_on:` — the index cannot say how this starts\n' "$rel"; RC=1; }
    fmkey "$f" fires_when >/dev/null || {
      printf '39\t%s\tno `fires_when:` — nothing to show in the index\n' "$rel"; RC=1; }
    case "$fo" in
      *event|*cadence)
        if grep -qE '^trigger_' "$f"; then
          printf '39\t%s\t`%s` declares a trigger_* key — a human-recognized moment has no mechanical trigger\n' "$rel" "$fo"
          RC=1
        fi ;;
    esac
  done
done

# Pass 1d — the INSTANCE families carry the same contract as the plugin ones.
#
# Since 3.9.1 a gotcha, a hard rule, an ADR and a rubric are all concept files with frontmatter.
# The generated index reads `description` from them, so a file without one costs a full read to
# answer "what is this", which is the exact cost this whole layer exists to remove.
for d in docs docs/gotchas docs/rules docs/adr docs/rubrics docs/guardrails docs/protocols \
         docs/sessions docs/evolution docs/research docs/measurements; do
  [ -d "$REPO/$d" ] || continue
  for f in "$REPO/$d"/*.md; do
    [ -f "$f" ] || continue
    case "$(basename "$f")" in README.md|index.md|log.md) continue ;; esac
    rel="${f#"$REPO"/}"
    if [ "$(head -n1 "$f")" != "---" ]; then
      printf '39\t%s\tno frontmatter — invisible to the index\n' "$rel"; RC=1; continue
    fi
    fmkey "$f" type >/dev/null || { printf '39\t%s\tno `type:`\n' "$rel"; RC=1; }
    fmkey "$f" description >/dev/null || { printf '39\t%s\tno `description:`\n' "$rel"; RC=1; }
    load="$(fmkey "$f" load | sed 's/^load:[[:space:]]*//')"
    case "$load" in hot|warm|cold) ;; *) printf '39\t%s\t`load:` absent or outside hot|warm|cold\n' "$rel"; RC=1 ;; esac
  done
done

# Pass 2 — an op declares more, and what it declares must be true.
for f in "$OPS"/*.md; do
  [ -f "$f" ] || continue
  rel="${f#"$REPO"/}"
  base="$(basename "$f" .md)"

  [ "$(head -n1 "$f")" = "---" ] || continue

  for key in writes composes; do
    if ! fmkey "$f" "$key" >/dev/null; then
      printf '39\t%s\tfrontmatter has no `%s:`\n' "$rel" "$key"
      RC=1
    fi
  done

  # A `composes:` entry naming an op that does not exist is worse than no entry: the
  # reader trusts it precisely because it read the frontmatter instead of the body.
  deps="$(fmkey "$f" composes | sed 's/^composes:[[:space:]]*//; s/^\[//; s/\]$//; s/"//g; s/,/ /g')"
  for d in $deps; do
    [ -n "$d" ] || continue
    if [ ! -f "$OPS/$d.md" ]; then
      printf '39\t%s\tcomposes `%s`, which is not an op\n' "$rel" "$d"
      RC=1
    fi
    if [ "$d" = "$base" ]; then
      printf '39\t%s\tcomposes itself\n' "$rel"
      RC=1
    fi
  done
done

# Pass 4 — the generated indexes match the directories they describe.
#
# OKF endorses generating index.md (SPEC 8) and its conformance never checks an index against
# its own directory (11 is structural only). That check is left to the producer, so it lives
# here. A stale index is the worst kind of doc: it is the cheap thing a reader consults INSTEAD
# of listing the directory, so when it lies the reader never finds out.
IDX="$FT/tools/afm-index.sh"
if [ -x "$IDX" ] && [ -d "$REPO/docs" ]; then
  OUT="$(cd "$REPO" && "$IDX" --check-index 2>/dev/null)"
  if [ -n "$OUT" ]; then
    printf '%s\n' "$OUT" | while IFS= read -r l; do
      printf '39\t%s\tgenerated index is stale — run afm-index.sh --materialize\n' "${l#stale index: }"
    done
    RC=1
  fi
fi

exit $RC
