# AFM — Agent Flow Methodology

> The agent's operational playbook for this project (human or LLM).
> It mixes **Extreme Programming** (Kent Beck) + **Pragmatic Programmer** (Hunt/Thomas) + Bearboo-specific practices.
>
> This is the **canonical source** for how to run tasks here. If `CLAUDE.md` and this doc disagree, this doc wins.
>
> Retroactive adoption via `/afm:refactor` on 2026-06-30 (plugin `afm` v3.1.0-rc.6). Rules inherited from legacy code apply forward-only — see § 3.1.

---

## 1. Principles

### 1.1 From XP

- **TDD** — no new code without a test that fails first. Loop: red → green → refactor.
- **Continuous refactor** — after green, improve the design at once. Do not bank debt.
- **Simple design (YAGNI/DRY/KISS)** — the smallest solution for the current problem; duplication only after the second caller (Rule of Three); inline beats abstract.
- **Continuous integration** — small commits, fast merge, tests run every time.
- **Pair via review** — a human or LLM reviewer reviews every change before the main branch.

### 1.2 From Pragmatic Programmer

- **DRY** (Don't Repeat Yourself) — each piece of knowledge lives in one place.
- **Tracer Bullets** — to deliver end-to-end fast, start with the shell that connects all layers, then thicken it. Better than big-bang.
- **Don't Live with Broken Windows** — a known error/flaky test/lint warning becomes tech debt. Fix it now or open a named ticket.
- **Design by Contract** — public functions declare preconditions and postconditions via types. Invalid input fails early.
- **Rubber Duck** — if you cannot explain the change in 2 sentences, do not start.
- **Prototype to learn, discard the prototype** — exploration code does not reach the main branch.

### 1.3 This project

- **One responsibility per file.** A file does **one** thing well. If the name has a vague "e"/"And"/"Manager"/"Utils", the file hides two responsibilities — split it. A file is a unit of reasoning; you should read it whole in one mental diff.
- **File ≤ 300 lines.** A hard limit with strict exceptions (generated, whole schema, large fixture). Past that, split.
- **Explicit types at boundaries, inference elsewhere.** Write types on exported function params and returns. Let TS infer locals and internal helpers.
- **Zero `any` / `unknown` in your own helper.** `unknown` is valid only at the external-data boundary, before you validate with Zod and narrow.
- **DRY after the third caller** (Rule of Three). Two can be coincidence; three is a pattern. Never abstract earlier; never leave duplication after the third.
- **KISS beats YAGNI beats DRY.** Simple duplication > an elegant abstraction with a mental note. Fewer layers, fewer generics, fewer config options.
- **Comments are the exception.** Default = zero. Only for genuinely complex logic (a hidden invariant, a bug workaround, a counterintuitive choice). Before you comment: rename, extract, simplify.
- **A doc evolves by delta, not a monolithic rewrite (ACE).** A `/docs/` update is a **structured append** to the right section or an **update-in-place** of a named item — never a full-doc rewrite.
- **Ingest is a cardinality fan-out, not a single append.** When you redefine a term/concept/contract that appears in several docs, the update touches every page where it lives (`grep -rl "<term>" docs/`), not just the obvious one.
- **Promoting to a durable doc goes through the negative-filter.** Before it becomes a `gotcha`/`learning`/`rule`/`procedure`, every signal passes the [`rubrics/negative-filters.md`](rubrics/negative-filters.md) checklist.
- **Server Component is the default (Next.js App Router).** Use `"use client"` only for real interactivity (state, DOM event, browser hook). Today there are 14 uses in `src/app/` — review, not a mechanical trigger (no grep tells "justified" from "not justified").
- **Prisma migrations are forward-compatible.** A column drop or destructive rename needs a dual-read phase before removal — without it, a rolling deploy opens an error window. Review, not a trigger.
- **Test the limits where the function can break, not just the happy path.** Every threshold (`.max()`/`.min()`, numeric comparison, file/string size), boundary (exactly at the limit vs. one more/less), and rejection path (`throw`/`ctx.addIssue`/`.reject`) needs its own test — a passing valid case is not evidence that rejection works. Review, not a mechanical trigger: no grep/count tells "thought about the real limits" from "a generic rejection test just to hit the count" (the same anti-Goodhart problem — any `.rejects` test passes without testing the specific limit). Lesson from `021-media-upload` (2026-07-26): the 300-character cap on `altText`, present in the original plan, silently vanished in a schema rewrite for the `FormData` shape — no test covered that branch, so nothing flagged it. It surfaced only when the owner asked "did you validate how far this breaks?" and the honest answer was no. Writing the boundary test afterward is what revealed the bug — not the reverse.

- **Everything in English; `/docs/` in STE-spirit.** Identifiers (models, fields, functions, variables), comments, commit messages, **and `/docs/`** — plus the methodology `.md` files outside them (CLAUDE.md/AGENTS.md/README.md) — are written in **English**. `/docs/` follows **Simplified Technical English at the "spirit" level** (ADR-0021): short active sentences, one idea per sentence, the same term for the same concept, vertical lists, no flair/metaphor/hedge. This is **not** the full letter of ASD-STE100 — no ~900-word approved dictionary and no mandatory articles/repetition (measured at +11% tokens; STE-spirit measures −15~26%, so the spirit is the target). **Exception:** a string literal that becomes user-visible text (UI copy, an `err.message`/`message` rendered on screen), demo/seed data (`prisma/seed*.ts`), and a test fixture that needs the accent to test (e.g. `kebabCase.ts` testing accent removal) stay Portuguese — it is product content/data, not an identifier, even inside a `.ts`. It also covers process artifacts: **branch name, PR title and body, labels** are process identifiers, always English (without the copy exception). The PR subset becomes hard rule 34 (mechanical); the rest — including Portuguese comments in code — is checked by review (no grep catches accent-free Portuguese without high false positives, and the accent alone collides with the content exceptions). Known legacy debt: Portuguese comments in `prisma/slug.ts`, `src/test/prisma/index.ts`, `src/context/trpc/sessionRefreshLink.ts`, and the migration `20250731144607_*` — boy-scout when you touch the file.
- **Converting `/docs/` to English/STE-spirit is forward-only** (ADR-0021). A new doc is born in English STE-spirit. The live normative core (`afm`/`ach`/`prd`/`ust`/`gotchas`/`roadmap`/`rubrics`) converts **doc-by-doc, in its own PR** (rule 17 — no collapse). Historical record is **not** rewritten: ADRs and delivered `features/` stay as-is; the append-only ledger (`docs/sessions/`, `docs/.afm-log/`) is forbidden to rewrite by rule 18. Until the conversion reaches a doc, it stays pt-BR — the docs are bilingual **per doc**, never per line.

*[A DEFINIR — product-intent-specific principles come from the retroactive-adoption interview.]*

---

## 2. Task flow

```
1. READ       → 2. UNDERSTAND → 3. PLAN   → 4. RED
                                              ↓
8. REPEAT   ← 7. COMMIT   ← 6. REFACTOR ← 5. GREEN
                                              ↓
                                         8.5 RECONCILE
```

### 1. READ

- `/docs/prd.md` for product context (which RF the task serves).
- `/docs/ust.md` for the matching story (US-NNN) — acceptance criteria are the oracle.
- `/docs/ach.md` for structure (where the code goes, which component).
- `/docs/gotchas.md` if the touched area has a registered trigger.
- Existing code in the files that change + neighbors.

### 2. UNDERSTAND

- Restate in 2 sentences: *"what changes"* and *"why"*.
- If you cannot in 2 sentences → rubber duck or ask.
- List 3-5 files that will be touched.

### 3. PLAN

- Small change (< ~50 lines in 1-2 files): a mental plan + a commit note is enough.
- Medium/large change: an explicit plan file before you touch code.
- Architectural change: **stop and ask** (hard rule 11).

### 4. RED

- Write the test (unit / integration / e2e) that fails for the right reason.
- Or the type signature that does not compile.
- Confirm it fails for the expected reason before the code.

### 5. GREEN

- The smallest implementation that passes.
- Do not optimize, do not anticipate. Just pass.
- Run `tsc --noEmit` + affected `vitest`.

### 5.1 GREEN failed → capped reflect-retry

If GREEN does not go green, before you halt or ask, run a short self-correction loop anchored in the real test/`tsc` output (never "I reread it and it looks ok"). Cap 2 retries (3 attempts total); the same failure 2× → stop and escalate. Cap spent → record in `docs/.afm-log-failures/` before you report.

### 6. REFACTOR

- Remove duplication, improve names, extract constants/types if clarity improves.
- Run `tsc --noEmit` + affected tests + `yarn lint`.

### 7. COMMIT

- The message explains **why** (the diff already shows what).
- Reference the story: `US-NNN: ...` or the requirement: `RF-NN: ...`.
- One commit = one coherent change.
- Follow Conventional Commits (`.commitlintrc` already gates this via the `commit-msg` hook).

### 8. REPEAT

- Go back to step 4 for the next slice.

### 8.5 RECONCILE

Before you close the task, ask:

- **Did I learn something another dev without this session must know to not break things?** If yes → update `/docs/`:
  - New architectural decision → `/docs/adr/NNNN-title.md` + a line in `ach.md`.
  - Counterintuitive surprise → `/docs/gotchas.md`.
  - Reusable rule the user corrected → a new hard rule in `afm.md` (with a mechanical trigger).
  - New component → update `ach.md` § 3.
  - Product-scope change → `prd.md` § 4.

---

## 2.1 When a feature needs its own folder

The § 2 loop covers a small change. For a feature that hits **any** of the criteria below, open `docs/features/NNN-slug/`:

- > 1 day of work OR > 200 lines OR > 3 files.
- Touches a new layer or creates a new component (hard rule 11 trigger).
- Has a new external boundary (API, webhook, CLI, pub/sub contract).
- Has > 2 unknowns that would need `[NEEDS CLARIFICATION:]`.

On-demand helpers: `/afm:clarify`, `/afm:analyze`, `/afm:research`. Otherwise (small change): straight to § 2.

---

## 3. Hard rules

Every rule below has an **executable trigger** the agent runs at the keyboard — binary pass/fail. A rule without a trigger lives in § 1.3 as a principle.

1. **No new code without a test.** Includes a type test.
   *Verification:* `vitest` covers the new path; the diff shows a matching `.test.ts`.
2. **Zero `any` / `unknown` in your own helpers.**
   *Verification:* `grep -nE "\bany\b|\bunknown\b" src/` in non-boundary files.
4. **Do not commit with a broken type-check.**
   *Verification:* `npx tsc --noEmit`.
5. **One responsibility per file.** A vague name ("manager", "utils", "helpers" without a domain prefix) = split.
   *Verification:* `find src -type f \( -iname "*manager*" -o -iname "*utils*" -o -iname "*helpers*" \)` returns 0 without a domain prefix. Today it returns `src/lib/utils.ts` and `src/server/infra/container/helpers.ts` — see § 3.1 forward-only.
6. **File ≤ 300 lines.** Exceptions with a header that explains.
   *Verification:* `find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -name "*.test.*" -print0 | xargs -0 wc -l | awk '$2 != "total" && $1 > 300'`. **2 production files exceed today** (scan 2026-08-22): `src/server/models/post.ts` (416) and `src/server/features/post/schema.ts` (314) — neither is from this feature; treated as forward-only tech debt (§ 3.1), not a block. *(The command also lists `src/server/models/__test__/prismaModels.ts` (429) — a test file the `*.test.*` filter misses because of the `__test__/` naming; outside the rule's scope, which is production code.)*
7. **A domain-like file exports exactly ONE `domain_<action>` function.** Domain is business rule; query builder, schema/Zod, and transport glue do not go here.
   *Verification:* `for f in $(find src/server/features -path '*/domain/*.ts'); do n=$(rg -o '^export \{[^}]*\}' "$f" | tr ',' '\n' | wc -l); test "$n" -eq 1 || echo "$f: $n exports"; done` returns empty. **Compliant today** across 30 domain files.
10. **No backwards-compat shim.** The caller does not exist → delete. `// removed for X` pollutes.
    *Verification:* `grep -rn "removed\|deprecated\|legacy" src/`. **Compliant today** (0 occurrences).
11. **An architectural change stops and asks.** A new layer / first-class component / cross-module contract / folder refactor needs the architecture owner's sign-off.
    *Verification (mid-flight):* `git status --porcelain` shows an `A` for a new first-class directory under `src/`, OR the diff moves folders / introduces a new cross-module import → stop and ask.
12. *(principle — lives in § 1.3. No Task-like component in the project today — no job/queue/scheduler found in scan A.1. If one is introduced, promote to a hard rule with an idempotency trigger.)*
13. **Tokens and secrets do not leak.** Never log a token in the clear. Redact in errors. Never commit `.env`. **Covers `docs/sessions/`** — versioning narrative is a new leak path: the agent cites the command it ran, and the command had the key.
    *Verification:* `git diff --staged | grep -nE "(token|secret|api[_-]?key|password|bearer)\s*[:=]\s*['\"][^'\"]+"` returns 0; `git diff --staged --name-only | grep -E "(^|/)\.env"` empty; and about sessions, `git diff --staged -- docs/sessions/ | grep -nE "(sk-|ghp_|AIza|xox[baprs]-|eyJ[A-Za-z0-9_-]+\.eyJ)"` returns 0 (known credential prefixes — OpenAI/GitHub/Google/Slack/JWT).
15. **Error classification — Domain ≠ Transport.** Domain/Model does not import `TRPCError` (`@trpc/server`). The Procedure maps a domain error → `TRPCError` at the boundary, via `AppError`/`ErrorRegistry` (`ADR-0017`).
    *Verification:* `rg -l "TRPCError" src/server/features/*/domain/*.ts`. **Compliant today** — coordinated migration closed in `022-error-registry` (2026-07-27). See `ach.md` § 3.2.
16. **Validation at the boundary — schema only at a procedure's input/output.** Zod validates at (a) a procedure's `.input()`/`.output()` (`src/server/features/<feature>/schema.ts`), (b) an external payload. Domain/Model receives an already-validated shape.
    *Verification:* `rg -n "z\.|zod" src/server/models src/server/features/*/domain/*.ts` returns 0. **Compliant today.**
17. **A `/docs/` edit does not collapse the doc.** A rewrite that deletes more than half the lines in one edit stops and needs explicit review.
    *Verification:* `git diff --numstat -- docs/ | grep -vE '(^|/)\.afm-log|(^|/)_focus\.md$|(^|/)sessions/' | awk '$2 > 20 && $2/($1+$2+1) > 0.5 {print}'` returns empty.
18. **The capture substrate is append-only.** `docs/.afm-log/` only takes appends.
    *Verification:* `git log -p -- docs/.afm-log/events/ 2>/dev/null | grep -c '^-- \['` returns `0`.
19. **A recurring anchored failure becomes remediation.** Every `sig=` that appears ≥2× in `docs/.afm-log-failures/` must have a remediation artifact that cites it.
20. **`docs/_focus.md` is small, overwritable slot-state.**
    *Verification:* `{ [ -f docs/_focus.md ] && wc -l < docs/_focus.md || echo 0; } | awk '$1 > 40 {print "INCHOU"}'` returns empty.

### Project-specific rules (from 30)

30. **Domain/Procedure does NOT import `PrismaClient`/`@prisma/client`/the Prisma driver directly.** Data access goes through the injected `ctx.repositories`; `src/server/models/*`, `src/server/infra/drivers/prisma.ts`, and the test seam `src/test/prisma/` are the intentional data-layer exception.
    *Verification:* `rg -n "from.*@prisma/client|new PrismaClient|@/server/infra/drivers/prisma" src/server/features/*/domain/*.ts src/server/features/*/procedures/*.ts` returns 0. **Compliant today.**
31. **A route handler (`src/app/api/**/route.ts`) is thin.** It delegates to the tRPC handler; no inline business rule.
    *Verification:* `find src/app/api -name route.ts | xargs wc -l` — all < 80 lines. **Compliant today** (only route: `src/app/api/trpc/[trpc]/route.ts`).
32. **No direct commit to `main`/`develop`.** All code work happens on a feature branch created from `develop` (English name, e.g. `feature/016-search-content`), commits following `.commitlintrc` (Conventional Commits, English). PR against `develop` using `.github/pull_request_template.md`; only the owner approves/merges on GitHub. `main` only takes a merge from `develop` at release/deploy, never a commit or a feature-branch merge directly. GitHub branch protection (`main`/`develop`, PR required) is an extra layer — the primary enforcement is this check before you commit.
    *Verification:* `git rev-parse --abbrev-ref HEAD` is not `main` nor `develop`. If it is, create/switch to a feature branch before any `git commit`.

33. **A boundary error is classified: recoverable (`AppError`) vs. bug.** An expected business failure is an `AppError` (thrown in the domain, translated at the boundary — rule 15); an unexpected throw is a bug. The boundary **distinguishes the two** — it translates `AppError` → `TRPCError` and **rethrows the rest** — and never dresses a bug as a recoverable domain error. The classification feeds the canonical log line: the logging middleware (`withCanonicalLog` in `src/server/createRouter.ts`) calls `depositBoundaryError` to add `error.kind`/`error.level`/`error.retryable`/`error.code` to `ctx.log`, and a bug also carries its stack (rule 36, ADR-0022). Metadata (`retryable`/`level`, `ErrorLevel = fatal|error|warn|info`) lives in the catalogs `src/shared/error/catalog/*.ts` and is resolved by `AppError` with defaults `retryable=false`/`level=warn`. See ADR-0018 (extends ADR-0017; `Result<T,E>` was evaluated and rejected).
    *Verification:* `rg -l "new TRPCError" src/server/features/*/procedures/*.ts` returns empty — the translation no longer lives in the procedure, but in the single choke point `src/server/http/appErrorToTRPCError.ts`, which returns `null` for a non-`AppError` throw (a bug stays a bug, never wrapped as a domain error). **Compliant today** — centralized in `024-error-boundary-centralization` (2026-08-22, ADR-0019).
    *Note 2026-08-22:* the previous trigger (`comm -23` between who builds a `TRPCError` and who branches on `instanceof AppError`) measured the discipline **inside** each procedure. With the translation centralized, the first set became empty and the `comm` would pass **vacuously** — verifying nothing. The new trigger targets where the convention now lives.

34. **PR title and body in English.** It mechanizes in the GitHub artifact the § 1.3 principle "code in English" (branch name, PR title/body, labels — process identifiers, always English). Applies to a new PR (forward — PRs opened before this rule stay as they are). Covers title and body (the durable artifact that becomes history); does **not** cover the PR conversation/review, which follows the interlocutor's language, like chat. `.github/pull_request_template.md` is in English — a template that asks in Portuguese harvests Portuguese answers.
    *Verification:* `gh pr view <N> --json title,body -q '.title + "\n" + .body' | grep -nP '[À-ÿ]'` returns empty. Manual today (check before opening/at review); becomes a CI step when the pipeline (`.github/workflows/ci.yml`, PR #208) lands in develop. **Limit:** the grep catches accent, not accent-free Portuguese — but in long PR prose the accent is nearly inevitable, which makes the proxy strong; accent-free Portuguese that slips through is still a violation, caught at review.

35. **`src/shared/**` does not import `@trpc/*`.** `shared/` is vocabulary common to server and client; transport is one specific consumer's opinion. The error catalog declares only what is agnostic (`message`/`retryable`/`level`); the projection to the tRPC code lives in `src/server/http/appErrorTransport.ts` as `Record<ErrorCode, TRPC_ERROR_CODE_KEY>` — total, checked at compile time. A new consumer (job, CLI, webhook) gets its **own** table, not a column in the domain catalog. See ADR-0019.
    *Verification:* `rg -n "from \"@trpc" src/shared/` returns 0. **Compliant today** — inversion done in `024-error-boundary-centralization` (2026-08-22). *(The trigger targets the `import`: a raw `@trpc` grep would also match a mention in a comment.)*

36. **The boundary emits one canonical log line per call; the logger never carries a secret.** Every procedure call emits exactly one wide structured event at the boundary (`withCanonicalLog`), success or failure — JSON in prod, pretty in dev (`env.nodeEnv`). Enrich a line with `ctx.log.add({ ... })`; `LogFields` is scalar-only, so a raw `input`/`ctx`/`user` object cannot be dumped (also covering PII), and on emit a scrub drops a field named after a secret (`token`/`password`/`secret`/`authorization`/`cookie`) and masks a known credential shape in a value (the rule-13 prefixes) (rule 13). No `console.*` in `src/server/**`, except the sanctioned mock mailer transport. Logs go to stdout as one event stream (12-Factor); shipping/aggregation is the environment's job. See ADR-0022.
    *Verification:* `rg -n "console\.(log|info|warn|error|debug)" src/server --glob '!**/__test__/**'` returns only `src/server/integrations/gateway/mailer/transports/console.ts` (the mock mailer). **Compliant today** — added in `025-structured-logging` (2026-08-24, ADR-0022).

---

## 3.1 Forward-only rules

Retroactive adoption via `/afm:refactor` on **2026-06-30**. The rules below apply to **new code from this date** and to **modified files** (boy-scout rule). Legacy code that violates them is tracked tech debt, not a PR block.

| Rule | Reason for forward-only | Violation found | Tech debt tracked in |
| --- | --- | --- | --- |
| 1 — TDD/coverage | Backend coverage grew to ~90% by applying this rule to new code over time — no retroactive sweep needed (measured 2026-08-25, v8: `src/server`+`lib`+`shared` ~90.5% lines, `server/features` domain+procedures 98.9%, 86 test files / 411 tests + an integration suite). The remaining uncovered surface is frontend (`src/app`/`src/components` ~0%), deferred with the frontend refactor. | frontend `app`/`components` ~0% (whole-repo ~52%) | `[A DEFINIR — closes with the frontend refactor]` |
| 2 — zero `any`/`unknown` | Small volume, but still present in legacy helpers/components; does not block in-flight PRs until the boy-scout reaches it. | 5 occurrences | `[A DEFINIR]` |
| 5 — vague naming | 2 files without a domain prefix (`src/lib/utils.ts`, `src/server/infra/container/helpers.ts`). Renaming/splitting needs a review of every import. | `src/lib/utils.ts`, `src/server/infra/container/helpers.ts` | `[A DEFINIR]` |
| 6 — file ≤300 lines | Resolved by the `entities/` → `models/` migration (ADR-0007); kept as a forward-only rule for new code. | 0 production files >300 lines | — |

**Boy-scout criterion:** when you edit a legacy file that violates a forward-only rule, bring it to compliance in the same PR if the scope justifies. Otherwise, open a separate issue and link it.

**Rule 15 removed from this table on 2026-07-27** — coordinated migration closed in `022-error-registry`/`ADR-0017` (it was an exception in this table exactly because it needed a coordinated migration, not file-by-file boy-scout; the migration happened and rule 15 is universal again in § 3).

---

## 4. Guidelines by change type

### 4.1 Bug fix

1. Reproduce the bug in a test. **The test fails for the right reason before the fix.**
2. Implement the smallest fix that passes.
3. Run the whole suite — a bug fix often exposes another.
4. Commit: `fix: US-NNN / RF-NN — <the why>`.

### 4.2 New feature

1. Identify the matching US. If none exists, write it first (`/docs/ust.md`).
2. The Gherkin acceptance criterion becomes the first test.
3. Tracer bullet: connect UI → router → procedure → domain → entity → DB with the minimum, see the flow end-to-end.
4. Thicken layers via TDD.
5. Commit per slice.

### 4.3 Refactor

1. Green suite before you start.
2. No change to observable behavior. If it changes, it is a feature/fix, not a refactor.
3. Small, frequent changes.
4. If you find a missing test in an area you will touch, write it first.
5. Commit: `refactor: <the why>`.

### 4.4 New dependency

1. Justify in 2 lines in the commit / PR (what + why + alternative considered).
2. Check the license (MIT/Apache/BSD ok; GPL/AGPL warn).
3. Check the size (bundle size for client-side deps).

---

## 5. Off-track signals

- **Commenting out code to make a test pass.** False confidence.
- **A mock that simulates more than needed.** You are testing the mock.
- **Adding `biome-ignore`, `@ts-ignore`, `@ts-expect-error` without a ticket.** Broken window.
- **Creating a `utils.ts` function without a second caller.** Inline.
- **Duplicating business logic across transports.** Move it to pure Domain/Model.
- **Writing more than one implementation in parallel.** Choose one.
- **Wrapping every await in try/catch.** Typed errors > a generic catch.
- **Refactoring "while I'm here" without a prior test.** Another task.
- **A task dragging for hours without a commit.** The slice is bigger than ideal.
- **A test that only raises coverage %.** Delete it. Coverage is a metric, not a goal.
- **File > 300 lines.** "But it's cohesive!" — split.
- **A name with a generic "and"/"manager"/"helper"/"utils".** Rename or split in two.
- **`any` / `as any` appearing "because of TS".** Investigate the inference.
- **Code copied 3×.** Abstract.
- **An abstraction with 1 caller.** Inline.
- **A domain-like with 2+ exports.** Split.
- **A comment narrating *what*.** Delete; name + type already say it.
- **A comment compensating for hard code.** Refactor first.
- **Domain throwing `TRPCError` directly.** Rule 15 violation (forward-only today) — do not spread it; throw a domain error and let the Procedure map.

---

## 6. Definition of Done

Discovered in scan A.7 (local hooks — no CI in the repo then) and confirmed in the retroactive-adoption interview (2026-06-30): `.husky/pre-commit` runs `lint-staged`, configured in `package.json` to run `biome check --write` on supported staged files; `.husky/pre-push` runs `yarn lint` + `yarn test` (vitest); `.husky/commit-msg` runs `commitlint`. The merge DoD includes **test runner + type check**, even without formal CI then — the agent runs both by hand before it considers the task done.

**Updated 2026-07-04:** the test suite no longer depends on Postgres/Redis via Docker (`docker-compose-test.yml`, removed) — procedure tests now run against in-memory fake repositories and gateways injected via `TestContext` (`src/test/repositories/`, `src/test/gateways/`), which also made pre-push faster (seconds, not a container build).

**Updated 2026-07-06 (ADR-0011):** the hand-written fake repositories (`src/test/repositories/`) were replaced by **`prisma-mock`** — a fake client generated from `schema.prisma`, plugged into the driver seam via `vi.mock` in `src/test/setup.ts` (vitest `setupFiles`). Production models run intact in tests; only the gateways keep a manual fake (`src/test/gateways/`). Per-test isolation: `resetPrismaMock()` from `src/test/prisma/` (the lib's `$clear()` is buggy — see the comment in the seam). Rationale and alternatives in `docs/research/001-teste-prisma-sem-banco-real.md`.

**Updated 2026-08-20:** formal CI arrived (`.github/workflows/ci.yml`), triggered on `pull_request`/`push` to `develop`/`main`. Four parallel jobs: `typecheck` (`npx tsc --noEmit`), `lint` (`npx biome check .` — no `--write`, unlike the local hook, because CI must fail instead of fixing silently), `test` (`npm test`, `DISABLE_REDIS=true` to not pollute the log with connection retries — tests do not depend on real Postgres/Redis, see the 2026-07-04 note), `build` (`npm run build` against a real `postgres:16` service, because `prisma migrate deploy` — part of the `build` script since #206 — needs a reachable database). The DoD below stops being "the agent runs it by hand" and becomes **verified automatically on every PR**; the manual check stays as an early signal before the push.

- [ ] New tests cover the added/modified behavior, and run green.
- [ ] The whole suite runs green (`yarn test`) — gated by CI (`test` job).
- [ ] Type-check passes (`npx tsc --noEmit`) — gated by CI (`typecheck` job).
- [ ] Lint passes with no new warnings (`yarn lint`) — gated by `.husky/pre-commit` locally and by CI (`lint` job) on the PR.
- [ ] Production build passes (`npm run build`) — gated by CI (`build` job).
- [ ] No new `any`/`unknown`/`@ts-ignore` without a justification.
- [ ] No touched file passed 300 lines (or a documented exception).
- [ ] The commit references US/RF and explains the *why*, follows Conventional Commits.
- [ ] If a contract with another layer changed: ACH updated. If scope changed: PRD updated.
- [ ] If I learned something another dev must know: doc updated (ADR/gotcha/rule/feature).

### 6.1 Pre-push validation (already gated by hook — `.husky/pre-push`)

1. `yarn test` (vitest, no Docker/Postgres dependency — see the 2026-07-04 note above).

Confirmed in the interview: keep only the test runner in pre-push (do not add type-check/build to this hook — they stay in the merge DoD, § 6). Type-check/lint/build stay out of pre-push because they are slower; from 2026-08-20 they run in parallel in CI on every PR, so the local hook stays light on purpose — CI is the safety net, not the hook.

---

*Changes to this doc follow rule 11 (stop and ask) if they affect process.*
