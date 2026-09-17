#!/usr/bin/env bash
# Hard rule PLUGIN-40 — a doc under `docs/` cites no path that does not exist.
#
# Why it is a GATE and not prose. The lesson "a rename is finished when the WRITERS and the
# READERS both move" was already written down, in `_focus.md` and in a gotcha, and on 2026-08-30
# it failed twice inside the release that exists because of it: a runner glob kept matching only
# the old name shape, and then seven rule files kept showing a label pointing at files that had
# just moved. `afm-health.sh` DETECTED the second one and reported it at SessionStart — where it
# was read and passed over. Detection at the start of a session is not the same as refusal at the
# commit, and only one of the two arrives while the change is still in the hand of whoever made it.
#
# The check that makes this cheap to keep honest: a cited path resolves from the REPOSITORY ROOT
# **or** from the directory of the file that cites it. Both conventions are alive in a real
# instance, and a checker that knows only one invents findings — which is how a gate gets
# switched off.
set -u
: "${1:-staged}"   # the rule is about the CONTENT of the docs, not about the diff
REPO="${AFM_GATE_REPO:-$PWD}"
. "${AFM_GATE_LIB:?}/scope.sh"
. "${AFM_GATE_LIB:?}/ratchet.sh"

[ -d "$REPO/docs" ] || exit 0
TRACKED="$(cd "$REPO" && git ls-files 2>/dev/null || true)"

# The findings are collected, not streamed. Every loop below runs inside a pipeline subshell, so
# a counter incremented in there dies with it — a runner that prints its findings and still exits
# 0 is a verifier that reports and never refuses, which is the exact failure this rule is about.
FOUND="$(
while IFS= read -r f; do
  # NORMATIVE families only. The scope is not "every doc" and that is deliberate: a rubric
  # teaches with an ILLUSTRATIVE path (`src/lib/stripe/checkout.ts`), a research dossier quotes a
  # hypothetical one, and a feature's `tasks.md` is a historical plan that names paths as they
  # were on the day it was written. Pointing the gate at those produces 44 findings that are all
  # correct notation, and a gate that starts red is switched off the next day — which would take
  # every other rule in the same aggregator with it.
  case "$f" in
    docs/afm.md|docs/ach.md|docs/prd.md|docs/ust.md|docs/_focus.md) ;;
    docs/adr/*|docs/rules/*|docs/gotchas/*|docs/learnings/*|docs/guardrails/*|docs/procedures/*) ;;
    *) continue ;;
  esac
  [ -f "$REPO/$f" ] || continue
  ratchet_exempt PLUGIN-40 "$f" && continue
  dir="$(dirname "$f")"

  while IFS= read -r line; do
    # A line that ANNOUNCES a removal is a historical record, not a reference. An ADR's job is
    # to cite what stopped existing.
    printf '%s' "$line" | grep -qiE 'remov|deprecat|legacy|no longer|used to|until [0-9]' && continue
    printf '%s\n' "$line" | grep -oE '`[A-Za-z0-9_./-]+\.[A-Za-z]+`' | tr -d '`' | while IFS= read -r p; do
      case "$p" in
        */*) ;;                 # only a PATH; a bare filename in prose is not a reference
        *) continue ;;
      esac
      case "$p" in
        http*|*..*) continue ;;
        .*/*) continue ;;       # a dot-dir path is the notation for a materialized instance
        /docs/*|/*) continue ;; # `/docs/x.md` is AFM notation for the consumer, not an absolute path
        *.*.*/*) continue ;;    # a domain, not a path
        *NNN*|*NN-*|*YYYY*|*MM.md|*'{{'*) continue ;;   # a placeholder shape, not a path
        */_shared/*) continue ;;                        # a proposed layout, not one that exists
      esac
      [ -e "$REPO/$p" ] && continue          # from the repository root
      [ -e "$REPO/$dir/$p" ] && continue     # from the citing file's own directory
      esc="$(printf '%s' "$p" | sed 's/[.[*^$\\]/\\&/g')"
      printf '%s\n' "$TRACKED" | grep -qE "(^|/)${esc}\$" && continue
      printf 'PLUGIN-40\t%s\t%s does not exist, from the repository root or from %s/\n' "$f" "$p" "$dir"
    done
  done < "$REPO/$f"
done < <(scope_all '*.md')
)"

[ -z "$FOUND" ] && exit 0
printf '%s\n' "$FOUND"
exit 1
