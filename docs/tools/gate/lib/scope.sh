#!/usr/bin/env bash
# Scope of a runner: which files to look at, in each mode.
#
# `staged` looks at the INDEX, because the index is what becomes the commit. Failing on a
# dirty file that is not staged is a false positive, and a gate with false positives is a
# gate people work around.
#
# Declared limit: the CONTENT rules read the file on disk, not the blob in the index. In the
# normal flow (edit, add, commit) the two are the same. Under a partial `git add -p` the gate
# can report a line that is not staged. We prefer the rare false positive to the silent false
# negative, but this is a known imprecision, not an oversight.
#
# Sourceable, not executable: `. "${AFM_GATE_LIB}/scope.sh"`.

# UNTRACKED files are part of the working tree, so `worktree` must include them. Until
# 3.9.0-rc.8 it did not: `git ls-files` lists what git tracks and `git diff HEAD` compares
# against what git tracks, and a file created one minute ago is in neither. A brand new secret
# (rule 13) or a brand new document in the wrong language (rule 37) therefore passed at exit 0,
# and exit 0 from a gate reads as "I looked and it is clean", never as "I did not look". The
# gate failed in the direction that looks like success.
#
# `--exclude-standard` keeps .gitignore out: an ignored file is a deliberate stance, not debt.
# `staged` deliberately does NOT include them — a file nobody added is not entering this commit,
# and failing on it would be the false positive that makes people work around the gate.

# scope_untracked [pathspec...] -> untracked, non-ignored paths
scope_untracked() { git ls-files --others --exclude-standard -- "$@"; }

# scope_files <mode> [pathspec...] -> paths relative to the repository root
scope_files() {
  local mode="$1"; shift
  case "$mode" in
    worktree) { git ls-files -- "$@"; scope_untracked "$@"; } | sort -u ;;
    *)        git diff --cached --name-only --diff-filter=ACMR -- "$@" ;;
  esac
}

# scope_diff <mode> [pathspec...] -> the added content only (new lines)
#
# For an untracked file there is no blob to diff against, so we synthesize one with
# `git diff --no-index /dev/null <file>`. That form is read-only. `git add -N` would give the
# same output by writing to the index, and a gate does not write. `--no-index` exits 1 whenever
# it finds a difference, which is always here, so its status is discarded on purpose.
scope_diff() {
  local mode="$1"; shift
  case "$mode" in
    worktree)
      git diff HEAD -- "$@"
      local f
      while IFS= read -r f; do
        [ -f "$f" ] || continue
        git diff --no-index -- /dev/null "$f" || true
      done < <(scope_untracked "$@")
      ;;
    *)        git diff --cached -- "$@" ;;
  esac
}

# scope_all [pathspec...] -> EVERY tracked file.
#
# It exists because there are two classes of rule and they cannot share a scope:
#
#   * a DIFF rule (a plaintext secret, a version bump, a test that must run) speaks about what
#     enters the commit. Its scope is the index. Its budget is normally 0: a new secret is
#     never "inside the quota". A measured exception exists — a rule can hold a small budget in
#     one region when the gate itself found pre-existing debt there.
#
#   * a COUNT rule (a path convention, the language of an identifier, a single source) speaks
#     about a total of the repository, compared against the ratchet. Its scope is the whole
#     repository, ALWAYS, even under `--staged`.
#
# Counting a count rule over the index is a silent FALSE NEGATIVE. With a budget of 7, a commit
# that adds 1 new violation counts 1 <= 7 and passes clean. The ratchet means "it did not grow"
# only when it measures the same total it recorded.
#
# It takes the mode from `AFM_GATE_MODE`, exported by the aggregator, because its signature has
# to stay `scope_all [pathspec...]`: every runner in this repository and every runner a consumer
# already wrote calls it that way. Under `--worktree` it also counts the untracked files, for the
# same reason `scope_files` does. Default `staged` keeps a runner called directly by hand honest.
scope_all() {
  case "${AFM_GATE_MODE:-staged}" in
    worktree) { git ls-files -- "$@"; scope_untracked "$@"; } | sort -u ;;
    *)        git ls-files -- "$@" ;;
  esac
}
