#!/usr/bin/env bash
# Mechanical gate for the hard rules of `docs/afm.md` § 3.
#
#   guardrails.sh              # look at the INDEX (what becomes the commit); exit 1 on a violation
#   guardrails.sh --worktree   # look at the working tree
#   guardrails.sh --audit      # prove that rule and runner are in sync, both ways
#   guardrails.sh --self-test  # prove the aggregator catches what it claims to catch
#   guardrails.sh --baseline   # measure HEAD and record the debt, so the gate starts green
#   guardrails.sh --install    # arm the pre-commit hook (opt-in, never automatic)
#
# Why it exists: hard rules with an executable trigger written in PROSE never run. A rule that
# holds only when the agent remembers to run the grep fails exactly when context gets tight.
#
# Runner contract (`<rules>/<NN>-<slug>.sh`):
#   argv[1]          : "staged" | "worktree"
#   env RATCHET      : path of the ratchet TSV
#   env AFM_GATE_LIB : directory holding scope.sh and ratchet.sh
#   stdout           : one line per finding — "<NN>\t<path>[:<line>]\t<message>"
#   exit 0           : compliant · exit 1 : violated · exit 2 : COULD NOT decide
#
# Exit 2 is deliberately distinct from 1: "I could not verify" must never become "it failed".
# A runner can depend on a tool the machine does not have. The first machine without it would
# turn the gate into a permanent block, and a gate like that gets disabled — together with
# every other rule in the same aggregator.
set -u

V="${V:-}"
MODE=staged
ACTION=run
REPO=""
RULES_DIR=""
CORE_RULES_DIR=""
AFM_DOC=""
RATCHET_ARG=""

usage() {
  printf 'usage: %s [-v] [--staged|--worktree] [--audit|--self-test|--install|--baseline]\n' "$0" >&2
  printf '                     [--repo <dir>] [--rules <dir>] [--core-rules <dir>]\n' >&2
  printf '                     [--ratchet <tsv>] [--afm-doc <md>]\n' >&2
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    -v|--verbose) V=1 ;;
    --staged)     MODE=staged ;;
    --worktree)   MODE=worktree ;;
    --audit)      ACTION=audit ;;
    --self-test)  ACTION=selftest ;;
    --install)    ACTION=install ;;
    --baseline)   ACTION=baseline ;;
    --repo)       shift; [ $# -gt 0 ] || usage; REPO="$1" ;;
    --rules)      shift; [ $# -gt 0 ] || usage; RULES_DIR="$1" ;;
    --core-rules) shift; [ $# -gt 0 ] || usage; CORE_RULES_DIR="$1" ;;
    --ratchet)    shift; [ $# -gt 0 ] || usage; RATCHET_ARG="$1" ;;
    --afm-doc)    shift; [ $# -gt 0 ] || usage; AFM_DOC="$1" ;;
    *) usage ;;
  esac
  shift
done

# --- Where things are -------------------------------------------------------
# The aggregator is canonical in the plugin and materialized in the consumer, so it cannot
# derive the repository from its own location. It asks git, and falls back to the working
# directory when git has nothing to say.
if [ -z "$REPO" ]; then
  REPO="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
fi

# The library travels next to this script, whichever copy is running.
AFM_GATE_LIB="${AFM_GATE_LIB:-$(cd "$(dirname "$0")" && pwd)/lib}"
export AFM_GATE_LIB
# The mode reaches a runner as $1, but `scope_all` takes no mode argument and cannot grow one
# without breaking every runner a consumer already wrote. It reads this instead.
export AFM_GATE_MODE="$MODE"
# shellcheck source=lib/ratchet.sh
. "$AFM_GATE_LIB/ratchet.sh"

# Two candidates, in order. A consumer that took the materialized layout needs no flag; a
# project that already keeps its gates somewhere else passes --rules and --ratchet.
first_existing() {
  local c
  for c in "$@"; do [ -e "$c" ] && { printf '%s' "$c"; return 0; }; done
  printf '%s' "$1"
}

[ -n "$RULES_DIR" ] || RULES_DIR="${AFM_GATE_RULES:-$(first_existing "$REPO/docs/tools/gate/rules" "$REPO/test/rules")}"

# The gate has TWO classes of runner, and conflating them was a real defect (ADR 0021).
#
#   PROJECT rules  — `$RULES_DIR`. One project's rules about its own CODE. The plugin ships
#                    none of these, and the README in `gate/rules/` explains why: a consumer
#                    that inherits a rule nobody chose bypasses it first.
#   ARTIFACT rules — `$CORE_RULES_DIR`. The contract the plugin already imposes on the `docs/`
#                    it materializes: English prose, no absolute path, the OKF frontmatter, a
#                    versioned runner behind every 0/1 trigger. Nobody "chooses" these — they
#                    are what an AFM instance IS. Until 3.20.0 they lived in one repository and
#                    every consumer got an `afm.md` that stopped at rule 21.
#
# A project runner with the same NN WINS over the shipped one, so a consumer can override
# without forking the plugin.
[ -n "$CORE_RULES_DIR" ] || CORE_RULES_DIR="${AFM_GATE_CORE_RULES:-$(first_existing "$REPO/docs/tools/gate/core-rules" "$REPO/test/core-rules")}"
[ -n "$AFM_DOC" ]   || AFM_DOC="${AFM_GATE_DOC:-$REPO/docs/afm.md}"
if [ -n "$RATCHET_ARG" ]; then
  RATCHET="$RATCHET_ARG"
else
  RATCHET="${RATCHET:-$(first_existing "$REPO/docs/tools/gate/ratchet.tsv" "$REPO/test/baseline/ratchet.tsv")}"
fi
export RATCHET

# Absolute before the `cd` below, because a relative path passed on the command line is
# relative to where the operator stood, not to the repository.
abspath() {
  case "$1" in
    /*) printf '%s' "$1" ;;
    *)  printf '%s/%s' "$(pwd)" "$1" ;;
  esac
}
RULES_DIR="$(abspath "$RULES_DIR")"
CORE_RULES_DIR="$(abspath "$CORE_RULES_DIR")"
# A runner may invoke the aggregator again (rule PLUGIN-35 does exactly that). Without these,
# the nested call re-resolves the directories from the DEFAULTS and reports every shipped rule
# as a phantom gate — a failure invented by the check itself.
export AFM_GATE_RULES="$RULES_DIR"
export AFM_GATE_CORE_RULES="$CORE_RULES_DIR"
AFM_DOC="$(abspath "$AFM_DOC")"
RATCHET="$(abspath "$RATCHET")"
export RATCHET

# Stand in the repository before running anything. `scope_all` and `scope_files` ask git, and
# git answers about the CURRENT DIRECTORY: from a subdirectory it lists only that subdirectory,
# and from another repository it lists that other repository. Measured 2026-08-26 while testing
# the refutation of ADR 0017 — the gate was invoked with `--repo <other project>` from this
# repository and reported findings in `plugins/afm/`, under the other project's name. A count
# rule that measures the wrong tree does not fail; it reports a number that looks right.
cd "$REPO" || { printf 'cannot enter %s\n' "$REPO" >&2; exit 2; }

# A runner must NOT derive the repository from its own path. Until 3.20.0 every one of them ran
# `REPO="$(cd "$(dirname "$0")/../.." && pwd)"`, which is only correct while the runner sits
# exactly two levels below the root. The moment a runner shipped with the plugin — five levels
# down — that expression pointed at `tools/`, and rule 37 reported "cannot be decided" against a
# file that was right there. The aggregator already stands in the repository, so it hands the
# answer down instead of letting each runner guess.
export AFM_GATE_REPO="$REPO"

# --- Scoreboard -------------------------------------------------------------
# Silent when green, loud when red. A gate that talks while everything is fine trains the
# operator to ignore its output, and then the red line disappears in the noise.
PASS=0; FAIL=0; NOTE=0
sec()  { [ -n "$V" ] && printf '%s\n' "$1"; return 0; }
ok()   { PASS=$((PASS+1)); [ -n "$V" ] && printf '  ok   — %s\n' "$1"; return 0; }
bad()  { FAIL=$((FAIL+1)); printf '  FAIL — %s\n' "$1"; }
# A note is KNOWN DEBT or "could not decide". Neither is actionable at commit time, so it only
# shows under -v, or under --audit, which is where you look at debt on purpose.
note() { NOTE=$((NOTE+1)); [ -n "$V" ] && printf '  note — %s\n' "$1"; return 0; }

summary() {
  if [ "$FAIL" -gt 0 ]; then
    printf '\n%d ok, %d fail, %d note (known debt: %s --audit)\n' "$PASS" "$FAIL" "$NOTE" "$0"
  elif [ -n "$V" ]; then
    printf '\n%d ok, %d note\n' "$PASS" "$NOTE"
  fi
  [ "$FAIL" -eq 0 ]
}

# A rule ID has TWO namespaces, and that is what removed the number reservation (ADR 0021).
#
#   PLUGIN-<n>  a rule the plugin ships. It is the contract of the `docs/` AFM materializes.
#   <n>         a rule this project wrote about its own code.
#
# Before 3.20.0 the template reserved 18-29 for "universal rules, which grow with each release"
# and told a project to start at 30. A reservation is a promise about numbers nobody can keep:
# this repository had already spent 35-39 on rules that turned out to be universal, and the
# moment they shipped, any consumer's own rule 35 collided with them. A namespace cannot
# collide, and it also says where a rule came from, which the number alone never did.
#
# An organisation policy rule stays numbered 100 or higher — a third namespace, already
# distinct, and left alone here.
rule_number() { basename "$1" | sed -E 's/^((PLUGIN-)?[0-9]+)-.*/\1/'; }

# --- Core: run one runner and decide against the ratchet --------------------
# A runner only knows how to find a violation. The budget belongs to the aggregator. That keeps
# the ratchet rule in one place and keeps runners dumb, which is what makes them cheap to write
# and cheap to audit.
run_rule() {
  local f="$1" nn out rc line path region
  nn="$(rule_number "$f")"

  out="$("$f" "$MODE" 2>/dev/null)"
  rc=$?

  if [ "$rc" = "2" ]; then
    note "rule ${nn}: the runner could not decide (missing dependency) — this is not a violation"
    return 0
  fi

  if [ -z "$out" ]; then
    ok "rule ${nn}"
    return 0
  fi

  # Group the findings by the most specific configured region.
  local -A tally=()
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    path="$(printf '%s' "$line" | cut -f2 | cut -d: -f1)"
    region="$(ratchet_region "$nn" "$path")"
    tally["$region"]=$(( ${tally["$region"]:-0} + 1 ))
  done <<< "$out"

  local budget r n
  for r in "${!tally[@]}"; do
    n="${tally[$r]}"
    budget="$(ratchet_budget "$nn" "$r")"
    if [ "$n" -le "$budget" ]; then
      note "rule ${nn} in '${r}': ${n}/${budget} within the ratchet$( [ -n "$(ratchet_note "$nn" "$r")" ] && printf ' (%s)' "$(ratchet_note "$nn" "$r")" )"
    else
      bad "rule ${nn} in '${r}': ${n} violation(s), budget ${budget}"
      printf '%s\n' "$out" | awk -F'\t' '{ printf "         %s — %s\n", $2, $3 }'
    fi
  done
}

# The one place that decides WHICH runners exist. Project rules win over shipped ones on a
# number collision, so a consumer overrides by dropping a same-numbered file into its own dir.
# Every caller that used to glob a single directory goes through here — a second glob left
# behind is a rule that runs in `run_all` and is invisible to `--audit`, which is the shape of
# defect this whole release is about.
rule_files() {
  local d f nn
  local -A seen=()
  for d in "$RULES_DIR" "$CORE_RULES_DIR"; do
    [ -d "$d" ] || continue
    # BOTH shapes. `[0-9]*.sh` alone silently skipped every shipped runner, because a namespaced
    # name starts with `P`. The glob matched nothing, and a glob that matches nothing reports
    # nothing — the audit went green while the entire core-rules directory was invisible.
    for f in "$d"/[0-9]*.sh "$d"/PLUGIN-[0-9]*.sh; do
      [ -f "$f" ] || continue
      nn="$(rule_number "$f")"
      [ -n "${seen[$nn]:-}" ] && continue
      seen[$nn]="$f"
    done
  done
  for nn in $(printf '%s\n' "${!seen[@]}" | sort -n); do printf '%s\n' "${seen[$nn]}"; done
}

run_all() {
  local f found=0
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    [ -x "$f" ] || { bad "runner is not executable: $f"; continue; }
    found=1
    run_rule "$f"
  done < <(rule_files)
  [ "$found" = 1 ] || note "no runner in ${RULES_DIR} or ${CORE_RULES_DIR} — the gate is empty"
}

# --- Baseline: measure HEAD so the gate can start green ---------------------
# `ops/rule.md` step 3 already requires this measurement before a rule is turned on. Doing it by
# hand means it does not get done, and the rule is then turned on in a repository that already
# breaks it. A gate that starts red is disabled the next day.
#
# It only ever APPENDS, and only for a rule that has no row yet. Overwriting would erase the one
# thing in the ratchet that cost real work: a region boundary somebody decided on.
baseline() {
  sec "== baseline: measuring HEAD =="
  local f nn out rc n added=0

  if [ ! -f "$RATCHET" ]; then
    mkdir -p "$(dirname "$RATCHET")" || { printf 'cannot create %s\n' "$RATCHET" >&2; return 1; }
    printf 'rule\tregion\tcount\tnote\n' > "$RATCHET"
    printf 'created %s\n' "$RATCHET"
  fi

  local stamp
  stamp="$(date +%Y-%m-%d)"

  while IFS= read -r f; do
    [ -n "$f" ] && [ -x "$f" ] || continue
    nn="$(rule_number "$f")"

    if ratchet_has_rule "$nn"; then
      printf '  skip — rule %s already has a row; a measured decision is never overwritten\n' "$nn"
      continue
    fi

    out="$("$f" worktree 2>/dev/null)"
    rc=$?
    if [ "$rc" = "2" ]; then
      printf '  skip — rule %s could not decide; nothing to record\n' "$nn"
      continue
    fi

    n="$(printf '%s' "$out" | grep -c . || true)"
    printf '%s\t.\t%s\tmeasured at baseline on %s\n' "$nn" "$n" "$stamp" >> "$RATCHET"
    added=$((added+1))
    if [ "$n" -gt 0 ]; then
      printf '  debt — rule %s: %s finding(s) recorded as pre-existing\n' "$nn" "$n"
    else
      printf '  clean — rule %s: born at 0, and growth now fails\n' "$nn"
    fi
  done < <(rule_files)

  printf '\n%d rule(s) recorded in %s\n' "$added" "$RATCHET"
  [ "$added" -gt 0 ] && printf 'The debt is a starting point, not a target. It only decreases.\n'
  return 0
}

# --- Audit: rule and runner, both ways --------------------------------------
# A rule with a 0/1 trigger and no runner is a PHANTOM GATE: the doc promises a check nobody
# runs, which is worse than promising nothing — it buys trust it cannot back up.
rules_declared() {
  [ -f "$AFM_DOC" ] || return 0
  awk '/^## 3\./{f=1} /^## [0-9]/&&!/^## 3\./{if(f)f=0} f' "$AFM_DOC" \
    | sed -nE 's/^((PLUGIN-)?[0-9]+)\. \*\*.*/\1/p'
}

# Which surface enforces a rule: `pre-commit`, `ci`, or `agent` (judgment, no runner).
#
# It reads the *Verification* line of the rule. That line used to live inside § 3 of `afm.md`,
# and since 3.9.1 the rules are one file each under `rules/` while § 3 is only an index. This
# function kept reading `afm.md` alone, found no *Verification* line for any rule, and answered
# `agent` for all of them — so the phantom-gate branch below could never fire. Measured on
# 2026-08-30: deleting rule 37's runner produced no finding at all, from the very check whose
# whole purpose is to catch a rule that promises a gate nobody runs.
#
# Both layouts are read, inline first, because an instance that has not migrated still has the
# line in `afm.md` and must not lose the check on the way to the split layout.
rule_surface() {
  local id="$1" body out
  # The ID can hold a `-`, which is not a regex metacharacter, so a literal anchor is enough.
  out="$(awk -v r="^${id}\\. " '
    $0 ~ r {f=1}
    f && /\*Verification/ {
      if (match($0, /\*Verification \(([a-z-]+)\)/, m)) { print m[1]; exit }
      print "agent"; exit
    }
  ' "$AFM_DOC" 2>/dev/null)"
  [ -n "$out" ] && { printf '%s' "$out"; return 0; }

  for body in "$(dirname "$AFM_DOC")/rules/${id}-"*.md; do
    [ -f "$body" ] || continue
    out="$(awk '
      /\*Verification/ {
        if (match($0, /\*Verification \(([a-z-]+)\)/, m)) { print m[1]; exit }
        print "agent"; exit
      }' "$body" 2>/dev/null)"
    [ -n "$out" ] && { printf '%s' "$out"; return 0; }
  done
  printf 'agent'
}

audit_debt() {
  [ -f "$RATCHET" ] || return 0
  # A note that opens with `PERMANENT:` is a DECLARATION, not debt. Some regions never decrease
  # by their nature — episodic history that only grows, and fixtures whose assertions match their
  # own content — and listing them as debt forever makes the debt list mean less every time it is
  # read. The count still holds the ceiling, so a real increase is still caught.
  awk -F'\t' 'NR>1 && $3+0 > 0 {
    if ($4 ~ /^PERMANENT:/) { sub(/^PERMANENT:[[:space:]]*/, "", $4)
      printf "  declared — rule %s in %s: %s, permanent (%s)\n", $1, $2, $3, $4 }
    else printf "  debt — rule %s in %s: %s (%s)\n", $1, $2, $3, $4
  }' "$RATCHET"
}

audit() {
  local nn f have
  for nn in $(rules_declared); do
    have=""
    while IFS= read -r f; do
      [ "$(rule_number "$f")" = "$nn" ] && have="$f"
    done < <(rule_files)
    if [ -n "$have" ]; then
      ok "rule ${nn} has a runner ($(basename "$have"))"
    else
      case "$(rule_surface "$nn")" in
        pre-commit|ci) bad "rule ${nn} declares a gate but has no runner in ${RULES_DIR} or ${CORE_RULES_DIR} — phantom gate" ;;
        *)             note "rule ${nn} is an 'agent' surface (no runner, by design)" ;;
      esac
    fi
  done
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    nn="$(rule_number "$f")"
    rules_declared | grep -qx "$nn" \
      && ok "runner ${nn} matches a declared rule" \
      || bad "orphan runner: $(basename "$f") matches no rule in § 3 of ${AFM_DOC}"
  done < <(rule_files)
}

# --- Self-test --------------------------------------------------------------
mk_runner() {  # $1=dir $2=NN $3=exit $4=finding lines (separated by §)
  local p="$1/$2-fixture.sh"
  { printf '#!/usr/bin/env bash\n'
    [ -n "$4" ] && printf '%s\n' "$4" | tr '§' '\n' | while IFS= read -r l; do
      [ -n "$l" ] && printf 'printf "%%b\\n" "%s"\n' "$l"
    done
    printf 'exit %s\n' "$3"
  } > "$p"
  chmod +x "$p"
  printf '%s' "$p"
}

SPASS=0; SFAIL=0
sok()  { SPASS=$((SPASS+1)); [ -n "$V" ] && printf '  ok   — %s\n' "$1"; return 0; }
snote() { [ -n "$V" ] && printf "  note — %s\n" "$1"; return 0; }
sbad() { SFAIL=$((SFAIL+1)); printf '  FAIL — %s\n' "$1"; }

selftest() {
  sec "== aggregator self-test (synthetic fixtures) =="
  TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
  mkdir -p "$TMP/rules"
  local saved_dir="$RULES_DIR" saved_core="$CORE_RULES_DIR" saved_ratchet="$RATCHET" saved_doc="$AFM_DOC"

  RULES_DIR="$TMP/rules"
  # The self-test builds its own fixtures. A real shipped runner leaking in would make the
  # aggregator prove itself against rules the fixture never declared.
  CORE_RULES_DIR="$TMP/core-rules"; mkdir -p "$CORE_RULES_DIR"
  RATCHET="$TMP/ratchet.tsv"; export RATCHET
  printf 'rule\tregion\tcount\tnote\n' > "$RATCHET"

  # 1. a runner that exits 1 fails the aggregator, and the rule number reaches the output.
  mk_runner "$TMP/rules" 99 1 "99\tsrc/a.ts:3\tviolated" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all > "$TMP/out" 2>&1
  [ "$FAIL" -gt 0 ] && sok "a runner that exits 1 fails the aggregator" || sbad "the aggregator ignored a red runner"
  grep -q '99' "$TMP/out" \
    && sok "the output names the violated rule" \
    || sbad "the output does not name the rule"

  # 2. a compliant repository: exit 0 AND silence.
  rm -f "$TMP/rules"/*.sh
  mk_runner "$TMP/rules" 98 0 "" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  local keepv="$V"; V=""
  run_all > "$TMP/out" 2>&1
  V="$keepv"
  [ "$FAIL" -eq 0 ] && sok "a compliant repository does not fail" || sbad "the aggregator failed a compliant repository"
  [ ! -s "$TMP/out" ] && sok "a compliant repository prints nothing" || sbad "the aggregator spoke while green: $(cat "$TMP/out")"

  # 3. exit 2 becomes a note, never a failure.
  rm -f "$TMP/rules"/*.sh
  mk_runner "$TMP/rules" 97 2 "" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -eq 0 ] && [ "$NOTE" -gt 0 ] \
    && sok "exit 2 becomes a note, not a failure" \
    || sbad "exit 2 was treated as a violation (FAIL=$FAIL NOTE=$NOTE)"

  # 4. ratchet: inside the budget passes, growth fails.
  rm -f "$TMP/rules"/*.sh
  printf 'rule\tregion\tcount\tnote\n96\t.\t3\tmeasured debt\n' > "$RATCHET"
  mk_runner "$TMP/rules" 96 1 "96\ta.ts:1\tx§96\tb.ts:1\tx§96\tc.ts:1\tx" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -eq 0 ] && sok "3 findings against a budget of 3 pass (ratchet)" || sbad "the ratchet failed inside its budget"
  rm -f "$TMP/rules"/*.sh
  mk_runner "$TMP/rules" 96 1 "96\ta.ts:1\tx§96\tb.ts:1\tx§96\tc.ts:1\tx§96\td.ts:1\tx" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -gt 0 ] && sok "4 findings against a budget of 3 fail (the ratchet only decreases)" || sbad "the ratchet let the debt grow"

  # 5. the most specific configured region wins over the generic one.
  rm -f "$TMP/rules"/*.sh
  printf 'rule\tregion\tcount\tnote\n95\t.\t0\t-\n95\tsrc/legacy\t2\tlegacy\n' > "$RATCHET"
  mk_runner "$TMP/rules" 95 1 "95\tsrc/legacy/a.ts:1\tx§95\tsrc/legacy/b.ts:1\tx" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -eq 0 ] && sok "a finding lands in the most specific configured region" || sbad "the specific region was ignored"

  # 5b. a region is a PATH, so it only matches at a path boundary. `index(p,$2)==1` is a literal
  # character prefix, and `docs/research-extra/x.md` starts with the characters of
  # `docs/research`. The neighbour's debt therefore landed in this region's budget: found by an
  # external probe (3.9.0-rc.7). A budget that absorbs a directory nobody measured is a budget
  # that stops meaning anything, and it fails toward green.
  rm -f "$TMP/rules"/*.sh
  printf 'rule\tregion\tcount\tnote\n94\t.\t0\t-\n94\tdocs/research\t2\tpre-existing\n' > "$RATCHET"
  mk_runner "$TMP/rules" 94 1 "94\tdocs/research-extra/a.md:1\tx§94\tdocs/research-extra/b.md:1\tx" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -gt 0 ] \
    && sok "a sibling directory does not spend the neighbouring region's budget" \
    || sbad "docs/research-extra was absorbed by the docs/research budget (prefix without a boundary)"

  # ...and the region must still cover its own subtree, and itself.
  rm -f "$TMP/rules"/*.sh
  mk_runner "$TMP/rules" 94 1 "94\tdocs/research/a.md:1\tx§94\tdocs/research/deep/b.md:1\tx" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -eq 0 ] \
    && sok "the region covers its own subtree" \
    || sbad "the boundary broke the legitimate match inside the region"

  # A budget bash cannot compare is malformed, not a budget. The ratchet TSV is written by hand,
  # and an all-digit value beyond the 64-bit range survives awk (which prints it back as
  # 100000000000000000000) and then breaks `[ -le ]` itself with "integer expression expected" —
  # which evaluates falsy, so the finding counts as over budget AND stderr fills up. Same defect
  # class the Stop hook already paid for on the cadence threshold.
  printf 'rule\tregion\tcount\tnote\n93\t.\t99999999999999999999\tuncomparable\n' > "$RATCHET"
  B="$(ratchet_budget 93 .)"
  ERR="$( { [ 1 -le "$B" ]; } 2>&1 )"
  [ -z "$(printf '%s' "$ERR" | grep -iE 'integer|inteiro')" ] \
    && sok "an uncomparable budget never reaches [ -le ] raw" \
    || sbad "ratchet_budget returned a value bash cannot compare: [$B]"
  printf 'rule\tregion\tcount\tnote\n93\t.\t7\tnormal\n' > "$RATCHET"
  [ "$(ratchet_budget 93 .)" = "7" ] \
    && sok "a sane budget is unaffected by the clamp" \
    || sbad "the clamp broke a normal budget"

  # 6. --audit catches a rule with no runner and a runner with no rule.
  rm -f "$TMP/rules"/*.sh
  AFM_DOC="$TMP/afm.md"
  printf '## 3. Rules\n\n77. **A rule with a gate.**\n\n    *Verification (pre-commit):* rules/77-x.sh\n\n78. **A rule of judgment.**\n\n    *Verification:* eye to eye\n\n## 4. Other\n' > "$AFM_DOC"
  PASS=0; FAIL=0; NOTE=0
  audit >/dev/null 2>&1
  [ "$FAIL" -gt 0 ] && sok "--audit reports a pre-commit rule with no runner (phantom gate)" || sbad "--audit let a phantom gate through"
  [ "$NOTE" -gt 0 ] && sok "--audit does not demand a runner for an 'agent' rule" || sbad "--audit demanded a runner for a judgment rule"
  mk_runner "$TMP/rules" 77 0 "" >/dev/null
  mk_runner "$TMP/rules" 66 0 "" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  audit >/dev/null 2>&1
  [ "$FAIL" -gt 0 ] && sok "--audit reports an orphan runner" || sbad "--audit let a runner with no rule through"

  # 7. --baseline turns a red gate green, and only by recording what it measured.
  rm -f "$TMP/rules"/*.sh
  printf 'rule\tregion\tcount\tnote\n' > "$RATCHET"
  mk_runner "$TMP/rules" 94 1 "94\ta.ts:1\tx§94\tb.ts:1\tx§94\tc.ts:1\tx" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -gt 0 ] && sok "a rule with no row starts red" || sbad "a rule with no row did not start red"
  baseline >/dev/null 2>&1
  awk -F'\t' 'NR>1 && $1=="94" && $3=="3"{f=1} END{exit !f}' "$RATCHET" \
    && sok "--baseline records the measured count" \
    || sbad "--baseline did not record the measured count: $(cat "$RATCHET")"
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -eq 0 ] && sok "after --baseline the gate starts green" || sbad "the gate stayed red after --baseline"
  rm -f "$TMP/rules"/*.sh
  mk_runner "$TMP/rules" 94 1 "94\ta.ts:1\tx§94\tb.ts:1\tx§94\tc.ts:1\tx§94\td.ts:1\tx" >/dev/null
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -gt 0 ] && sok "growth past the baseline still fails" || sbad "the baseline became a licence to grow"

  # 8. --baseline never overwrites a row a human decided on.
  printf 'rule\tregion\tcount\tnote\n93\tsrc/legacy\t2\thuman decision\n' > "$RATCHET"
  rm -f "$TMP/rules"/*.sh
  mk_runner "$TMP/rules" 93 1 "93\ta.ts:1\tx§93\tb.ts:1\tx§93\tc.ts:1\tx" >/dev/null
  baseline > "$TMP/out" 2>&1
  awk -F'\t' 'NR>1 && $1=="93" && $2=="src/legacy" && $4=="human decision"{f=1} END{exit !f}' "$RATCHET" \
    && sok "--baseline leaves a registered row untouched" \
    || sbad "--baseline overwrote measured debt"
  [ "$(awk -F'\t' 'NR>1 && $1=="93"' "$RATCHET" | wc -l)" = "1" ] \
    && sok "--baseline adds no second row for a registered rule" \
    || sbad "--baseline duplicated a registered rule"
  grep -q 'skip' "$TMP/out" \
    && sok "--baseline says out loud which rule it skipped" \
    || sbad "--baseline skipped in silence"

  # 9. an empty gate is empty, not failed.
  rm -f "$TMP/rules"/*.sh
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -eq 0 ] && [ "$NOTE" -gt 0 ] \
    && sok "an empty gate reports empty, and does not fail" \
    || sbad "an empty gate did not behave as empty (FAIL=$FAIL NOTE=$NOTE)"

  # 10. the runner receives AFM_GATE_LIB, and the library is really there.
  printf '#!/usr/bin/env bash\n. "${AFM_GATE_LIB:?}/scope.sh"\nexit 0\n' > "$TMP/rules/92-lib.sh"
  chmod +x "$TMP/rules/92-lib.sh"
  PASS=0; FAIL=0; NOTE=0
  run_all >/dev/null 2>&1
  [ "$FAIL" -eq 0 ] \
    && sok "a runner resolves its library through AFM_GATE_LIB" \
    || sbad "AFM_GATE_LIB did not reach the runner"

  # --- 3.20.0: the two-class gate. Each block below is one defect that reported GREEN ---
  sec "== self-test: PLUGIN- namespace and exemptions =="

  mkdir -p "$TMP/core-rules"
  CORE_RULES_DIR="$TMP/core-rules"
  printf '#!/usr/bin/env bash\nprintf "PLUGIN-81\\tsrc/a.ts\\tfinding\\n"\nexit 1\n' > "$TMP/core-rules/PLUGIN-81-x.sh"
  chmod +x "$TMP/core-rules/PLUGIN-81-x.sh"

  # 1. the glob. `[0-9]*.sh` alone never matches a name that starts with `P`, and a glob that
  #    matches nothing reports nothing — the whole shipped directory was invisible.
  if rule_files | grep -q 'PLUGIN-81-x.sh'; then
    sok "a PLUGIN- runner is found by rule_files"
  else
    sbad "rule_files skipped the namespaced runner — the core-rules directory is invisible"
  fi
  [ "$(rule_number "$TMP/core-rules/PLUGIN-81-x.sh")" = "PLUGIN-81" ] \
    && sok "rule_number keeps the namespace" \
    || sbad "rule_number stripped the namespace (got $(rule_number "$TMP/core-rules/PLUGIN-81-x.sh"))"

  # 2. a project runner with the same number wins, so a consumer overrides without a fork.
  printf '#!/usr/bin/env bash\nexit 0\n' > "$TMP/rules/82-mine.sh"; chmod +x "$TMP/rules/82-mine.sh"
  printf '#!/usr/bin/env bash\nexit 1\n' > "$TMP/core-rules/82-theirs.sh"; chmod +x "$TMP/core-rules/82-theirs.sh"
  rule_files | grep -q '82-mine.sh' && ! rule_files | grep -q '82-theirs.sh' \
    && sok "a project runner overrides a shipped one on the same number" \
    || sbad "the shipped runner won over the project's — an override is impossible"
  rm -f "$TMP/rules/82-mine.sh" "$TMP/core-rules/82-theirs.sh"

  # 3. an exempt row is a SCOPE statement, not a region with a budget of zero. Treating it as a
  #    region made it absorb every finding under the path and fail there — the exemption became
  #    its own opposite.
  printf 'rule\tregion\tcount\tnote\nPLUGIN-83\tsrc/vendor\texempt\tnot ours\n' > "$TMP/ratchet.tsv"
  RATCHET="$TMP/ratchet.tsv"; export RATCHET
  ratchet_exempt PLUGIN-83 src/vendor/lib.ts \
    && sok "an exempt row takes a path out of scope" \
    || sbad "ratchet_exempt did not match its own row"
  ratchet_exempt PLUGIN-83 src/vendor-extra/lib.ts \
    && sbad "the exemption leaked past the path boundary" \
    || sok "an exemption stops at the path boundary"
  [ "$(ratchet_region PLUGIN-83 src/vendor/lib.ts)" = "." ] \
    && sok "an exempt row is not a region" \
    || sbad "an exempt row became a region with budget 0 — the exemption inverted"

  # 4. rule_surface must read the SPLIT layout. Since 3.9.1 the *Verification* line lives in
  #    rules/<id>-*.md and § 3 is an index; reading afm.md alone answered `agent` for every rule,
  #    which silently disabled the phantom-gate branch.
  mkdir -p "$TMP/rules-doc"
  AFM_DOC="$TMP/afm.md"
  printf '## 3. Rules\n\nPLUGIN-84. **Split layout.** — [`rules/PLUGIN-84-x.md`](./rules/PLUGIN-84-x.md)\n\n## 4. Other\n' > "$AFM_DOC"
  mkdir -p "$TMP/rules"; mkdir -p "$(dirname "$AFM_DOC")/rules"
  printf -- '---\ntype: rule\n---\n\n# Hard rule PLUGIN-84\n\n*Verification (pre-commit):* rules/PLUGIN-84-x.sh\n' \
    > "$(dirname "$AFM_DOC")/rules/PLUGIN-84-x.md"
  [ "$(rule_surface PLUGIN-84)" = "pre-commit" ] \
    && sok "rule_surface reads the split layout" \
    || sbad "rule_surface answered '$(rule_surface PLUGIN-84)' — the phantom-gate branch is dead"
  rules_declared | grep -qx 'PLUGIN-84' \
    && sok "rules_declared reads a namespaced index entry" \
    || sbad "rules_declared skipped the namespaced rule"

  # 5. PLUGIN-40 resolves a cited path from the repo root OR from the citing file's directory.
  #    A checker that knows only one convention invents findings, and a gate that invents
  #    findings is switched off — the same end as a gate that finds nothing.
  mkdir -p "$TMP/repo/docs/rules" "$TMP/repo/docs/adr" "$TMP/repo/src"
  : > "$TMP/repo/src/real.ts"
  printf -- '*Verification:* [`tools/gate/ghost.sh`](x)\n' > "$TMP/repo/docs/rules/PLUGIN-99-x.md"
  printf -- 'The file `src/real.ts` is fine.\n' > "$TMP/repo/docs/adr/0001-y.md"
  # Resolves ONLY from the citing file's own directory. Without this case the assertion above
  # passes with the directory branch deleted, which is a test of nothing.
  printf -- 'See `notes/sibling.md` next to me.\n' > "$TMP/repo/docs/adr/0002-z.md"
  # `scope_all` asks git, and git answers about the CURRENT directory — a fixture that is not a
  # repository yields an empty file list, and the runner then finds nothing for the wrong reason.
  ( cd "$TMP/repo" && git init -q . && git add -A ) >/dev/null 2>&1
  # Created AFTER `git add`, so it is UNTRACKED. That is the case where the directory-relative
  # branch is the only thing that saves it: the `git ls-files` fallback matches by suffix and
  # would cover a tracked sibling on its own, which made the first version of this assertion
  # pass with the branch deleted — a test of nothing.
  mkdir -p "$TMP/repo/docs/adr/notes"; : > "$TMP/repo/docs/adr/notes/sibling.md"
  P40="$(dirname "$0")/core-rules/PLUGIN-40-dead-reference.sh"
  if [ -x "$P40" ]; then
    P40OUT="$(cd "$TMP/repo" && AFM_GATE_REPO="$TMP/repo" AFM_GATE_LIB="$AFM_GATE_LIB" AFM_GATE_MODE=worktree RATCHET=/dev/null bash "$P40" worktree 2>/dev/null)"
    printf '%s' "$P40OUT" | grep -q 'ghost.sh' \
      && sok "PLUGIN-40 finds a path that exists under neither convention" \
      || sbad "PLUGIN-40 missed a dead reference"
    printf '%s' "$P40OUT" | grep -q 'real.ts' \
      && sbad "PLUGIN-40 flagged a path that resolves from the repository root" \
      || sok "PLUGIN-40 accepts a path that resolves from the repository root"
    printf '%s' "$P40OUT" | grep -q 'notes/sibling.md' \
      && sbad "PLUGIN-40 flagged a path that resolves from the citing file's own directory" \
      || sok "PLUGIN-40 accepts a path relative to the citing file"
  else
    snote "PLUGIN-40 runner absent — skipped"
  fi

  rm -rf "$TMP/core-rules"
  CORE_RULES_DIR=""

  RULES_DIR="$saved_dir"; CORE_RULES_DIR="$saved_core"; RATCHET="$saved_ratchet"; AFM_DOC="$saved_doc"; export RATCHET
  printf '\n%d ok, %d fail (self-test)\n' "$SPASS" "$SFAIL"
  [ "$SFAIL" -eq 0 ]
}

# --- Install ----------------------------------------------------------------
install_gate() {
  # A repository CANNOT declare its own hooks. If it could, `git clone` would be remote code
  # execution. That is why every hook manager (husky, lefthook, pre-commit) charges a one-time
  # opt-in step. This is ours.
  #
  # Running a command called `--install` IS the authorization. What this mode never does is
  # install itself from a SessionStart or from another hook. An opt-in that installs itself is
  # not an opt-in, and the config is local, so every clone decides again.
  local hooks_dir="$REPO/.githooks"
  local gate_cmd
  gate_cmd="$(python3 - "$REPO" "$0" 2>/dev/null <<'PY' || printf '%s' "$0"
import os, sys
print(os.path.relpath(os.path.abspath(sys.argv[2]), os.path.abspath(sys.argv[1])))
PY
)"

  if [ ! -f "$hooks_dir/pre-commit" ]; then
    mkdir -p "$hooks_dir"
    { printf '#!/usr/bin/env sh\n'
      printf '# Gate for the hard rules — the surface that makes docs/afm.md § 3 executable.\n'
      printf '#\n'
      printf '# Deliberate escape: `git commit --no-verify`. That is not a failure mode. Friction is the\n'
      printf '# intended effect, and a gate with no escape becomes a gate that gets uninstalled.\n'
      printf 'exec ./%s --staged\n' "$gate_cmd"
    } > "$hooks_dir/pre-commit"
    chmod +x "$hooks_dir/pre-commit"
    printf 'wrote %s\n' ".githooks/pre-commit"
  fi

  local cur
  cur="$(git config --get core.hooksPath 2>/dev/null || true)"
  if [ "$cur" = ".githooks" ]; then
    printf 'The gate is already armed (core.hooksPath = .githooks).\n'
    return 0
  fi
  if [ -n "$cur" ]; then
    # Overwriting another manager's config in silence would disarm THEIR gate with nobody
    # noticing — the exact failure mode this gate exists to prevent.
    printf 'core.hooksPath already points at "%s" (another hook manager?).\n' "$cur" >&2
    printf 'I do not overwrite that in silence. Resolve the conflict and run again, or point\n' >&2
    printf 'that pre-commit at: ./%s --staged\n' "$gate_cmd" >&2
    return 1
  fi
  git config core.hooksPath .githooks || { printf 'failed to write core.hooksPath\n' >&2; return 1; }
  printf 'Gate armed: core.hooksPath = .githooks\n'
  printf 'Every `git commit` now goes through ./%s --staged.\n' "$gate_cmd"
  printf 'Deliberate escape: `git commit --no-verify`. Disarm: `git config --unset core.hooksPath`.\n'
  return 0
}

case "$ACTION" in
  selftest) selftest; exit ;;
  baseline) baseline; exit ;;
  install)  install_gate; exit ;;
  audit)
    sec "== audit: hard rule and runner =="
    audit
    printf '\n== debt recorded in the ratchet ==\n'
    audit_debt
    summary; exit ;;
  run)
    sec "== hard rule gate (mode: $MODE) =="
    run_all; summary; exit ;;
esac
