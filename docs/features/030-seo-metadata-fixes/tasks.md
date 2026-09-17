# Feature 030 — Tasks

> **Spec:** [`./spec.md`](./spec.md) · **Plan:** [`./plan.md`](./plan.md)
> Each task is one `core/afm.md` § 2 cycle (RED → GREEN → REFACTOR → COMMIT). `[P]` = no dependency on the task right before it.
> **Prerequisite:** met — no open `[NEEDS CLARIFICATION:]`; gate answered 2026-09-16 (soft-404 accepted; locale `en-US` kept; `og:image` generated).

## Phase 1 — Setup

- [X] **T001** [P] `docs/ust.md` + `docs/features/030-seo-metadata-fixes/` — register US-021 and materialize `spec.md`/`plan.md`/`tasks.md`; regenerate the docs indexes (US-021, RF-10)

## Phase 2 — Foundation (failing tests first)

- [X] **T002** RED: `src/lib/seo/__test__/metadata.ts` — root metadata carries the complete OG set (`type`/`locale`/`siteName`/`url`/`title`/`description`), `verification.google` only when a code is given, home canonical `/` (US-021)
- [X] **T003** GREEN: `src/lib/seo/metadata.ts` + wire `src/app/layout.tsx` and `src/app/page.tsx`; add `googleSiteVerification` to `src/lib/env/index.ts` (US-021)
- [X] **T004** RED: extend `src/server/http/__test__/buildArticleJsonLd.ts` — `publisher.name`, `inLanguage: "en-US"`, image fallback to the OG route when there is no cover (US-021)
- [X] **T005** GREEN: implement the new `buildArticleJsonLd` fields and pass the site values from the post page (US-021)
- [X] **T006** [P] `<h1>` on the home (`src/app/page.tsx`, "Latest posts") and on the post title (`page.tsx`, `h2` → `h1`) (US-021)

## Phase 3 — Boundary

- [X] **T007** [P] `src/app/opengraph-image.tsx` — generated `og:image` (1200×630, `next/og`, default font, alt text) (US-021)

## Phase 4 — Verification + Reconciliation (8.5)

- [ ] **T008** Verify — `npx biome check .`, `npx tsc --noEmit`, `npm test`, `npx next build` (US-021)
- [ ] **T009** `docs/gotchas/012-*` — register the streamed-404 behavior (`200` + `noindex`) and the accepted decision; append the 2026-09-16 note to the `docs/ust.md` soft-404 entry (US-021)
- [ ] **T010** Close the loop — US-021 → `done`, spec/plan headers → `done`; § 6.1 ritual, push, PR, then verify the Vercel preview tags live (US-021)

---

*Every task references US-021 or RF-10 in the commit (rule in `core/afm.md` § 2, step 7 COMMIT).*
*Never skip RED (rule 1 — TDD); the structural JSX tasks rely on the build + preview (documented gap).*
