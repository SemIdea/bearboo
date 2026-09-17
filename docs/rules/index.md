# rules

* [Hard rule 30 — Domain/Procedure does NOT import `PrismaClient`/`@prisma/client`/the Prisma driver directly.](30-domain-procedure-does-not-import-prismaclient.md) - Domain/Procedure does NOT import `PrismaClient`/`@prisma/client`/the Prisma driver directly.
* [Hard rule 31 — A route handler (`src/app/api/**/route.ts`) is thin.](31-a-route-handler-src-app-api.md) - A route handler (`src/app/api/**/route.ts`) is thin.
* [Hard rule 32 — No direct commit to `main`/`develop`.](32-no-direct-commit-to-main-develop.md) - No direct commit to `main`/`develop`.
* [Hard rule 33 — A boundary error is classified: recoverable (`AppError`) vs. bug.](33-a-boundary-error-is-classified-recoverable.md) - A boundary error is classified: recoverable (`AppError`) vs. bug.
* [Hard rule 34 — PR title and body in English.](34-pr-title-and-body-in-english.md) - PR title and body in English.
* [Hard rule 35 — `src/shared/**` does not import `@trpc/*`.](35-src-shared.md) - `src/shared/**` does not import `@trpc/*`.
* [Hard rule 36 — The boundary emits one canonical log line per call; the logger never carries a secret.](36-the-boundary-emits-one-canonical-log.md) - The boundary emits one canonical log line per call; the logger never carries a secret.
* [Hard rule PLUGIN-10 — No backwards-compat shim.](PLUGIN-10-no-backwards-compat-shim.md) - No backwards-compat shim.
* [Hard rule PLUGIN-11 — An architectural change stops and asks.](PLUGIN-11-an-architectural-change-stops-and-asks.md) - An architectural change stops and asks.
* [Hard rule PLUGIN-13 — Tokens and secrets do not leak.](PLUGIN-13-tokens-and-secrets-do-not-leak.md) - Tokens and secrets do not leak.
* [Hard rule PLUGIN-15 — Error classification — Domain ≠ Transport.](PLUGIN-15-error-classification-domain-transport.md) - Error classification — Domain ≠ Transport.
* [Hard rule PLUGIN-16 — Validation at the boundary — schema only at a procedure''s input/output.](PLUGIN-16-validation-at-the-boundary-schema-only.md) - Validation at the boundary — schema only at a procedure's input/output.
* [Hard rule PLUGIN-17 — A `/docs/` edit does not collapse the doc.](PLUGIN-17-a-docs-edit-does-not-collapse.md) - A `/docs/` edit does not collapse the doc.
* [Hard rule PLUGIN-18 — The capture substrate is append-only.](PLUGIN-18-the-capture-substrate-is-append-only.md) - The capture substrate is append-only.
* [Hard rule PLUGIN-19 — A recurring, anchored failure becomes remediation, not silent recurrence](PLUGIN-19-a-recurring-anchored-failure-becomes-remediation.md) - A recurring, anchored failure becomes remediation, not silent recurrence
* [Hard rule PLUGIN-1 — No new code without a test](PLUGIN-1-no-new-code-without-a-test.md) - No new code without a test
* [Hard rule PLUGIN-20 — `docs/_focus.md` is small, overwritable slot-state.](PLUGIN-20-docs-focus-md-is-small-overwritable.md) - `docs/_focus.md` is small, overwritable slot-state.
* [Hard rule PLUGIN-21 — INALIENABLE — code and tests are written in English](PLUGIN-21-inalienable-code-and-tests-are-written-in-eng.md) - INALIENABLE — code and tests are written in English
* [Hard rule PLUGIN-2 — Zero `any` / `unknown` in your own helpers.](PLUGIN-2-zero-any-unknown-in-your-own.md) - Zero `any` / `unknown` in your own helpers.
* [Hard rule PLUGIN-35 — A hard rule with a 0/1 trigger needs a versioned runner in the gate](PLUGIN-35-a-hard-rule-with-a-0-1-trigger-needs-a-versio.md) - A hard rule with a 0/1 trigger needs a versioned runner in the gate
* [Hard rule PLUGIN-36 — A doc under `docs/` carries no FILESYSTEM absolute path](PLUGIN-36-a-doc-under-docs-carries-no-filesystem-absolu.md) - A doc under `docs/` carries no FILESYSTEM absolute path
* [Hard rule PLUGIN-37 — The prose of an artifact is English](PLUGIN-37-the-prose-of-an-artifact-is-english.md) - The prose of an artifact is English
* [Hard rule PLUGIN-38 — A Portuguese literal never survives inside a script or inside a quoted marker](PLUGIN-38-a-portuguese-literal-never-survives-inside-a.md) - A Portuguese literal never survives inside a script or inside a quoted marker
* [Hard rule PLUGIN-39 — An indexed file carries the OKF contract, and an op declares what it writes and composes](PLUGIN-39-an-indexed-file-carries-the-okf-contract-and.md) - An indexed file carries the OKF contract, and an op declares what it writes and composes
* [Hard rule PLUGIN-40 — A normative doc cites no path that does not exist](PLUGIN-40-a-normative-doc-cites-no-path-that-does-not-e.md) - A normative doc cites no path that does not exist
* [Hard rule PLUGIN-4 — Do not commit with a broken type-check.](PLUGIN-4-do-not-commit-with-a-broken.md) - Do not commit with a broken type-check.
* [Hard rule PLUGIN-5 — One responsibility per file.](PLUGIN-5-one-responsibility-per-file.md) - One responsibility per file.
* [Hard rule PLUGIN-6 — File ≤ 300 lines.](PLUGIN-6-file-300-lines.md) - File ≤ 300 lines.
* [Hard rule PLUGIN-7 — A domain-like file exports exactly ONE `domain_<action>` function.](PLUGIN-7-a-domain-like-file-exports-exactly.md) - A domain-like file exports exactly ONE `domain_<action>` function.
