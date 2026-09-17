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

- **Everything in English; `/docs/` in STE-spirit.** Identifiers (models, fields, functions, variables), comments, commit messages, **and `/docs/`** — plus the methodology `.md` files outside them (CLAUDE.md/AGENTS.md/README.md) — are written in **English**. `/docs/` follows **Simplified Technical English at the "spirit" level** (ADR-0021): short active sentences, one idea per sentence, the same term for the same concept, vertical lists, no flair/metaphor/hedge. This is **not** the full letter of ASD-STE100 — no ~900-word approved dictionary and no mandatory articles/repetition (measured at +11% tokens; STE-spirit measures −15~26%, so the spirit is the target). **Exception — product content follows the product locale, not the identifiers-in-English rule:** a string literal that is user-visible text (UI copy, an `err.message`/`message` rendered on screen) or demo/seed data (`prisma/seed*.ts`) is content/data, not an identifier, even inside a `.ts`. The product locale is **en-US today** (single-locale, owner decision 2026-08-29), so this content is **English** now; a future i18n system will add pt-BR, at which point content becomes locale-specific. A test fixture that needs a specific accent/character to test (e.g. `kebabCase.ts` testing accent removal) may keep that literal regardless of locale — it is a test input, not content. **Content legacy debt:** the existing seed data (`prisma/seed*.ts`) and any UI copy still in Portuguese predate the en-US decision — migrate to en-US when you touch them, or in a dedicated pass. It also covers process artifacts: **branch name, PR title and body, labels** are process identifiers, always English (without the copy exception). The PR subset becomes hard rule 34 (mechanical); the rest — including Portuguese comments in code — is checked by review (no grep catches accent-free Portuguese without high false positives, and the accent alone collides with the content exceptions). Known legacy debt: Portuguese comments in `prisma/slug.ts`, `src/test/prisma/index.ts`, `src/context/trpc/sessionRefreshLink.ts`, and the migration `20250731144607_*` — boy-scout when you touch the file.
- **Converting `/docs/` to English/STE-spirit is forward-only** (ADR-0021). A new doc is born in English STE-spirit. The live normative core (`afm`/`ach`/`prd`/`ust`/`gotchas`/`roadmap`/`rubrics`) converts **doc-by-doc, in its own PR** (rule 17 — no collapse). Historical record is **not** rewritten: ADRs and delivered `features/` stay as-is; the append-only ledger (`docs/sessions/`, `docs/.afm-log/`) is forbidden to rewrite by rule 18. Until the conversion reaches a doc, it stays pt-BR — the docs are bilingual **per doc**, never per line.

*[TBD — product-intent-specific principles come from the retroactive-adoption interview.]*

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

**A load-bearing open decision carries `[NEEDS CLARIFICATION:]`** — including a bucket-(b) residue the delivery flow leaves for the gate. The `tasks` op refuses to run on it, and the `deliver` resumability detector greps for it; a decision written only in prose is invisible to both, and a resumed delivery can execute it unconfirmed.

---

## 3. Hard rules

Every rule below has an **executable trigger** the agent runs at the keyboard — binary pass/fail. A rule without a trigger lives in § 1.3 as a principle.


> **Each rule is its own file under [`rules/`](./rules/).** This section is the index:
> one line per rule, in the exact `N. **title**` shape that `afm-session-start.sh` and
> `afm-health.sh` parse. The body, the rationale and the verification travel with the file.

### Universal rules (PLUGIN namespace)

PLUGIN-1. **No new code without a test** — [`rules/PLUGIN-1-no-new-code-without-a-test.md`](./rules/PLUGIN-1-no-new-code-without-a-test.md)
PLUGIN-2. **Zero `any` / `unknown` in your own helpers.** — [`rules/PLUGIN-2-zero-any-unknown-in-your-own.md`](./rules/PLUGIN-2-zero-any-unknown-in-your-own.md)
PLUGIN-4. **Do not commit with a broken type-check.** — [`rules/PLUGIN-4-do-not-commit-with-a-broken.md`](./rules/PLUGIN-4-do-not-commit-with-a-broken.md)
PLUGIN-5. **One responsibility per file.** — [`rules/PLUGIN-5-one-responsibility-per-file.md`](./rules/PLUGIN-5-one-responsibility-per-file.md)
PLUGIN-6. **File ≤ 300 lines.** — [`rules/PLUGIN-6-file-300-lines.md`](./rules/PLUGIN-6-file-300-lines.md)
PLUGIN-7. **A domain-like file exports exactly ONE `domain_<action>` function.** — [`rules/PLUGIN-7-a-domain-like-file-exports-exactly.md`](./rules/PLUGIN-7-a-domain-like-file-exports-exactly.md)
PLUGIN-10. **No backwards-compat shim.** — [`rules/PLUGIN-10-no-backwards-compat-shim.md`](./rules/PLUGIN-10-no-backwards-compat-shim.md)
PLUGIN-11. **An architectural change stops and asks.** — [`rules/PLUGIN-11-an-architectural-change-stops-and-asks.md`](./rules/PLUGIN-11-an-architectural-change-stops-and-asks.md)
PLUGIN-13. **Tokens and secrets do not leak.** — [`rules/PLUGIN-13-tokens-and-secrets-do-not-leak.md`](./rules/PLUGIN-13-tokens-and-secrets-do-not-leak.md)
PLUGIN-15. **Error classification — Domain ≠ Transport.** — [`rules/PLUGIN-15-error-classification-domain-transport.md`](./rules/PLUGIN-15-error-classification-domain-transport.md)
PLUGIN-16. **Validation at the boundary — schema only at a procedure's input/output.** — [`rules/PLUGIN-16-validation-at-the-boundary-schema-only.md`](./rules/PLUGIN-16-validation-at-the-boundary-schema-only.md)
PLUGIN-17. **A `/docs/` edit does not collapse the doc.** — [`rules/PLUGIN-17-a-docs-edit-does-not-collapse.md`](./rules/PLUGIN-17-a-docs-edit-does-not-collapse.md)
PLUGIN-18. **The capture substrate is append-only.** — [`rules/PLUGIN-18-the-capture-substrate-is-append-only.md`](./rules/PLUGIN-18-the-capture-substrate-is-append-only.md)
PLUGIN-19. **A recurring, anchored failure becomes remediation, not silent recurrence** — [`rules/PLUGIN-19-a-recurring-anchored-failure-becomes-remediation.md`](./rules/PLUGIN-19-a-recurring-anchored-failure-becomes-remediation.md)
PLUGIN-20. **`docs/_focus.md` is small, overwritable slot-state.** — [`rules/PLUGIN-20-docs-focus-md-is-small-overwritable.md`](./rules/PLUGIN-20-docs-focus-md-is-small-overwritable.md)
PLUGIN-21. **INALIENABLE — code and tests are written in English** — [`rules/PLUGIN-21-inalienable-code-and-tests-are-written-in-eng.md`](./rules/PLUGIN-21-inalienable-code-and-tests-are-written-in-eng.md)
PLUGIN-35. **A hard rule with a 0/1 trigger needs a versioned runner in the gate** — [`rules/PLUGIN-35-a-hard-rule-with-a-0-1-trigger-needs-a-versio.md`](./rules/PLUGIN-35-a-hard-rule-with-a-0-1-trigger-needs-a-versio.md)
PLUGIN-36. **A doc under `docs/` carries no FILESYSTEM absolute path** — [`rules/PLUGIN-36-a-doc-under-docs-carries-no-filesystem-absolu.md`](./rules/PLUGIN-36-a-doc-under-docs-carries-no-filesystem-absolu.md)
PLUGIN-37. **The prose of an artifact is English** — [`rules/PLUGIN-37-the-prose-of-an-artifact-is-english.md`](./rules/PLUGIN-37-the-prose-of-an-artifact-is-english.md)
PLUGIN-38. **A Portuguese literal never survives inside a script or inside a quoted marker** — [`rules/PLUGIN-38-a-portuguese-literal-never-survives-inside-a.md`](./rules/PLUGIN-38-a-portuguese-literal-never-survives-inside-a.md)
PLUGIN-39. **An indexed file carries the OKF contract, and an op declares what it writes and composes** — [`rules/PLUGIN-39-an-indexed-file-carries-the-okf-contract-and.md`](./rules/PLUGIN-39-an-indexed-file-carries-the-okf-contract-and.md)
PLUGIN-40. **A normative doc cites no path that does not exist** — [`rules/PLUGIN-40-a-normative-doc-cites-no-path-that-does-not-e.md`](./rules/PLUGIN-40-a-normative-doc-cites-no-path-that-does-not-e.md)

### Specific to this repo (numbered from 30)

30. **Domain/Procedure does NOT import `PrismaClient`/`@prisma/client`/the Prisma driver directly.** — [`rules/30-domain-procedure-does-not-import-prismaclient.md`](./rules/30-domain-procedure-does-not-import-prismaclient.md)
31. **A route handler (`src/app/api/**/route.ts`) is thin.** — [`rules/31-a-route-handler-src-app-api.md`](./rules/31-a-route-handler-src-app-api.md)
32. **No direct commit to `main`/`develop`.** — [`rules/32-no-direct-commit-to-main-develop.md`](./rules/32-no-direct-commit-to-main-develop.md)
33. **A boundary error is classified: recoverable (`AppError`) vs. bug.** — [`rules/33-a-boundary-error-is-classified-recoverable.md`](./rules/33-a-boundary-error-is-classified-recoverable.md)
34. **PR title and body in English.** — [`rules/34-pr-title-and-body-in-english.md`](./rules/34-pr-title-and-body-in-english.md)
35. **`src/shared/**` does not import `@trpc/*`.** — [`rules/35-src-shared.md`](./rules/35-src-shared.md)
36. **The boundary emits one canonical log line per call; the logger never carries a secret.** — [`rules/36-the-boundary-emits-one-canonical-log.md`](./rules/36-the-boundary-emits-one-canonical-log.md)

## 3.1 Forward-only rules

Retroactive adoption via `/afm:refactor` on **2026-06-30**. The rules below apply to **new code from this date** and to **modified files** (boy-scout rule). Legacy code that violates them is tracked tech debt, not a PR block.

| Rule | Reason for forward-only | Violation found | Tech debt tracked in |
| --- | --- | --- | --- |
| 1 — TDD/coverage | Backend coverage grew to ~90% by applying this rule to new code over time — no retroactive sweep needed (measured 2026-08-25, v8: `src/server`+`lib`+`shared` ~90.5% lines, `server/features` domain+procedures 98.9%, 86 test files / 411 tests + an integration suite). The remaining uncovered surface is frontend (`src/app`/`src/components` ~0%), deferred with the frontend refactor. | frontend `app`/`components` ~0% (whole-repo ~52%) | `[TBD — closes with the frontend refactor]` |
| 2 — zero `any`/`unknown` | Small volume, but still present in legacy helpers/components; does not block in-flight PRs until the boy-scout reaches it. | 5 occurrences | `[TBD]` |
| 5 — vague naming | 2 files without a domain prefix (`src/lib/utils.ts`, `src/server/infra/container/helpers.ts`). Renaming/splitting needs a review of every import. | `src/lib/utils.ts`, `src/server/infra/container/helpers.ts` | `[TBD]` |
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
