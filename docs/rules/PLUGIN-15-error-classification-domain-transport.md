---
type: rule
description: 'Error classification — Domain ≠ Transport.'
load: warm
rule_number: PLUGIN-15
fires_on: event
fires_when: 'Error classification — Domain ≠ Transport.'
---

# Hard rule PLUGIN-15 — Error classification — Domain ≠ Transport.

Domain/Model does not import `TRPCError` (`@trpc/server`). The Procedure maps a domain error → `TRPCError` at the boundary, via `AppError`/`ErrorRegistry` (`ADR-0017`).
*Verification:* `rg -l "TRPCError" src/server/features/*/domain/*.ts`. **Compliant today** — coordinated migration closed in `022-error-registry` (2026-07-27). See `ach.md` § 3.2.
