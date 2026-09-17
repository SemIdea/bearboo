---
type: rule
description: 'A Portuguese literal never survives inside a script or inside a quoted marker'
load: warm
rule_number: PLUGIN-38
fires_on: event
fires_when: 'A Portuguese literal never survives inside a script or inside a quoted marker'
---

# Hard rule PLUGIN-38 — A Portuguese literal never survives inside a script or inside a quoted marker

# Hard rule PLUGIN-38 — A Portuguese literal never survives inside a script or inside a quoted marker.

    This is the remediation for the most frequent failure of the english-first migration: **the data was translated and the parser was not**, 14 times. The symptom never varies — a literal stays Portuguese, the target already changed spelling, the match returns zero, and every gate stays green. Three of the 14 killed a mechanism in silence: `afm-health.sh` matched `Substituída por ADR-` while the ADRs said something else (**vital sign A4 found zero, always**); `ops/restructure.md` read `Mordidas:`/`última:` while the template wrote `Bites:`/`last:` (**the dead-gotcha prune never found anything**); and `guardrails/README.md` documented the keys `sinal`/`gatilho` while the files used `signal:`/`trigger:` (**a new guardrail would be born invisible**). None of the 14 was caught by a gate. They were caught by reading.

    *Verification (pre-commit):* [`test/rules/38-parser-marker.sh`](../../test/rules/38-parser-marker.sh). Because the repo is english-first (rule 37), the heuristic is cheap and precise: an accented word inside a `.sh`, or inside a backtick span in a plugin `.md`, is a candidate. It does not prove drift — it says where drift lives, and a human triages. It complements rule 37, which only measures **prose density** in `.md` and is therefore blind both to shell and to a single stray literal inside otherwise-English documentation. **Two implementation notes that are themselves paid bugs:** (a) `LC_ALL=C` plus explicit alternation, never a `[À-ÿ]` range — that range is **invalid outside a UTF-8 locale** and aborts `grep`; the prototype swallowed that error with `2>/dev/null` and reported "0 findings" against a corpus with 6 known cases. (b) Backticks are paired with `awk` (even-indexed fields), never with `` `[^`]*…[^`]*` `` — that pattern also matches the **gap between** two code spans, which is how the first version reported "à la carte" as a Portuguese marker.
    *(Universal slots 18–20 — append-only substrate, recurring failure → remediation, `_focus` slot-state — activate only in a consumer that runs the delivery/evolve loop with `docs/.afm-log*`. Here they stay dormant until this repo uses those substrates.)*
