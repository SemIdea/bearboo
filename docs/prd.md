# PRD — Bearboo

> Product Requirements Document. Living doc — edit in place.
> Scope changes go through the product owner before merge.

## 1. Summary

Bearboo is a personal technical blog built for performance, code organization, and modern full-stack practices. It is a study repository and a practical architecture demo (DDD-lite, typed end-to-end layers) — not a product with an external user base today.

One-line value proposition: *"[A DEFINIR — validate with the product owner]"*

*(Source: the first paragraphs of `README.md`.)*

## 2. Problem & Opportunity

- **Observed pain:** it does not solve a third party's pain — it is the owner's study and technical-portfolio vehicle (practice full-stack architecture, end-to-end type safety, modern practices in real production).
- **Why now:** [A DEFINIR].
- **Size of the gain:** a practical, verifiable architecture demo (DDD-lite, tRPC, testable layers) for anyone who assesses the owner's work.

## 3. Target user & Jobs-to-be-done

**Primary persona:** a pair — (a) the dev himself (Bruno), who writes technical posts and evolves the architecture to practice; (b) recruiters/portfolio readers, who assess the published code and product.

**Typical companies:**
- [A DEFINIR — personal project, does not apply today].

**Jobs-to-be-done:**
- When Bruno wants to practice a new technique/architecture, I want a real project to apply it, to consolidate learning and keep a verifiable portfolio.
- When a recruiter/dev assesses Bruno, I want to see organized, tested production code, to form an opinion on work quality.

**Typical scenarios:**
- "Bruno wants to learn X (e.g. DDD, tRPC, ISR) and applies it on Bearboo to make it stick."
- "A recruiter clones the repo, reads `/docs/` and the code, and assesses the architecture in minutes."

## 4. Functional Requirements (RF)

| ID | Requirement | Priority |
| --- | --- | --- |
| RF-01 | User authentication — register, login, logout, and session with automatic refresh (Postgres as source of truth; Redis cache removed, pending a future rebuild). **Production hardening done** (`docs/features/001-auth-hardening/`): real session expiry (idle + max lifetime), refresh-token rotation with reuse detection, HttpOnly/SameSite=Lax cookies (never again in `document.cookie`/`localStorage`), per-endpoint rate limiting, generic login/reset messages against email enumeration. Infra hardening (TLS, `docker-compose.yml` credentials) deferred — see `docs/roadmap.md` | P0 |
| RF-02 | Email verification — a verification token sent by email, token resend | P0 |
| RF-03 | Password recovery — a reset token sent by email, password change | P0 |
| RF-04 | Post CRUD — create, read, update, delete, revalidate (ISR) | P0 |
| RF-05 | Post comment CRUD — create, list, update, delete | P0 |
| RF-06 | User profile — edit name/bio, view the user's published posts and comments | P1 |
| RF-07 | Admin/CMS (author) — the author controls publication status (draft/published/archived), previews an unpublished own post at the real URL, manages all own posts with a status/category/tag filter (`docs/roadmap.md` Phase 2); a site-wide panel for Admin/Editor comes via RF-08 (`013-role-based-permissions`) | P1 |
| RF-08 | Roles and permissions (Admin/Editor/Author) — `docs/roadmap.md` Phase 3: Admin/Editor edit/delete any user's post and manage categories, Author only their own; Admin promotes/demotes another user's role; the post panel (RF-07) becomes site-wide for Admin/Editor. The publish/archive restriction to Admin/Editor and the review workflow move to Phase 4 (`013-role-based-permissions/spec.md` § 4) | P1 |
| RF-09 | Editorial workflow (post review) — `docs/roadmap.md` Phase 4: new statuses `IN_REVIEW`/`SCHEDULED`; the Author submits a post for review, Admin/Editor approve/reject (with a mandatory reason)/publish directly/schedule/archive; `PostReviewComment` keeps the approval/rejection history; scheduling resolved via a lazy visibility check (no new scheduler). Edit-diff history (`PostRevision`) moves to a future round (`014-post-review-workflow/spec.md` § 4) | P1 |
| RF-10 | SEO and professional publishing — `docs/roadmap.md` Phase 5: dynamic sitemap.xml, robots.txt, RSS feed, canonical URL, Twitter Card, schema.org (`Article` JSON-LD), all computed from the post's existing fields (no migration, `015-seo-metadata`). Friendly slug + redirect (301 via `previousSlug`) and editable SEO override fields (`seoTitle`/`seoDescription`/`canonicalUrl`), closed in `018-seo-overrides-slug-redirect/spec.md` | P1 |
| RF-11 | Content search — `docs/roadmap.md` Phase 6: search by title/content (`contains`/`insensitive`, no migration — native Postgres full-text waits for a real integration test, see `ADR-0011`), with type-ahead suggestions that reuse the same endpoint. Tag/category filter and related posts existed before this feature (`readRecent`, `007-posts-relacionados`); sort by most-viewed (`sortBy: "mostViewed"`, `id` tiebreak for stable pagination) closed in `019-search-sort-by-views/spec.md`, unblocked by `Post.viewCount` from RF-12 | P2 |
| RF-12 | Internal analytics — `docs/roadmap.md` Phase 7: a post view recorded automatically on public read, an Admin/Editor dashboard with total views per post and a most-viewed ranking. The counting tech (a Redis buffer with a batched flush to Postgres, avoiding a dedicated message broker) investigated in `docs/research/002-redis-view-counting.md` and built in `ADR-0013`. Breakdown by period (7/30 days), traffic source, and user agent — deferred in `017-post-view-analytics/spec.md § 4` until raw-data retention/privacy was decided — closed in `020-view-analytics-breakdown/spec.md` (30-day retention with lazy deletion, no IP persisted) | P2 |
| RF-13 | Media upload and management — `docs/roadmap.md` Phase 8: an authenticated user uploads an image file (real upload, not just a URL), sees their own media library, deletes what they uploaded, fills alt text; Admin/Editor see/remove any user's media (same bypass pattern as `post:deleteAny`, RF-08). Upload validates size/format at the boundary. A post cover image (`010-post-cover-image`) can now come from an upload, without an external URL. Automatic image compression/optimization stays out of this round (`021-media-upload/spec.md § 4`) | P2 |
| RF-14 | Standardized error handling — `docs/roadmap.md` Phase 9: Domain/Procedure/Infra classification in `src/shared/error/*`, today only partly applied (rule 15 violation in ~18-24 `domain/*.ts`, see `docs/afm.md` § 3.1). `ErrorRegistry` (domain-namespaced code, `httpCode`/`message` resolved automatically in `DomainError`, no per-procedure switch/if-chain) formalized in `ADR-0017` (replaces `ADR-0016`), investigated in `docs/research/004-error-handler-patterns.md` | P2 |

*(RFs inferred from `git log` — `feat:` commits for register/login/session, token verification, password reset, post/comment CRUD, and profile editing. See the full history via `git log --oneline --grep=feat`.)*

**Discrepancy note:** `README.md` mentions "semantic post search using similarity vectors" among current features, but no implementation (embeddings/pgvector/similarity) was found in the code (`grep -rniE "embedding|vector|similarity|pgvector"` returns empty) — treat it as a roadmap item (`README.md` § Futuro), not an implemented RF. [A DEFINIR — confirm the real status with the product owner.]

## 5. Non-Functional Requirements (RNF)

| ID | Type | Criterion |
| --- | --- | --- |
| RNF-01 | Availability | [A DEFINIR] |
| RNF-02 | Latency | [A DEFINIR] |
| RNF-03 | Security | Hashed passwords (bcrypt), session/verification/reset tokens with expiry and single use (`used: Boolean`) |

*[A DEFINIR — numeric thresholds.]*

## 6. Stage Goals

> **The detailed phase plan lives in [`docs/roadmap.md`](./roadmap.md)** — 12 phases (0 to 11), from initial organization to observability. Not duplicated here (single source); this section only positions the current state within that plan.

### 6.1 MVP — current state

**Goal:** a public blog + auth + post/comment CRUD working end-to-end (roadmap Phase 0 done; Phase 1 "public blog" partly done).

**Scope already implemented:** RF-01 to RF-07.

**Roadmap Phase 1 done** (with 1 accepted residual — the HTTP status of `/post/[slug]`, see `docs/features/009-post-404-status/`). **Phase 2 done** (with 1 item deferred to Phase 8 — cover-file upload). See `docs/roadmap.md` for the per-feature breakdown.

**Discrepancy note vs. the roadmap:** the roadmap Phase 0 "suggested stack" lists Auth.js/Better Auth, Playwright, and GitHub Actions. Playwright/GitHub Actions were not adopted (tests are `vitest`, no CI — `.github/workflows/` absent, see `ach.md`). **Auth.js/Better Auth was an explicit decision not to adopt — see ADR-0005:** the custom auth (an opaque session in `Session`, Postgres as source of truth) is kept, with incremental hardening instead of a library swap.

**Acceptance criterion:** [A DEFINIR].

**Success metric:** [A DEFINIR].

### 6.2 GTM — roadmap Phases 2-5

Admin/CMS (Phase 2), authentication with Admin/Editor/Author roles (Phase 3), editorial workflow DRAFT→IN_REVIEW→SCHEDULED/PUBLISHED (Phase 4), full SEO (Phase 5). See `docs/roadmap.md` for each phase's features, models, and completion criteria.

### 6.3 First N — roadmap Phases 6-11

Search (6), internal analytics (7), media upload (8), production quality/tests (9), CI/CD and deploy (10), observability (11).

## 7. Metrics & North Stars [A DEFINIR]

[A DEFINIR.]

## 8. Risks & Mitigations [A DEFINIR]

| Risk | Impact | Probability | Mitigation |
| --- | --- | --- | --- |
| [A DEFINIR] | | | |

## 9. Non-scope (v1)

- **Semantic post search.** Mentioned in the README as a feature/future, with no current implementation — out of scope until it becomes a confirmed RF.
- **Everything in `docs/roadmap.md` Phases 3-11** (roles and permissions, editorial workflow, full SEO, search, analytics, media upload, CI/CD, observability) — planned, not built (Phase 2, admin/CMS, became RF-07 and is done). This is not permanent "out of scope", it is *not yet* — each phase enters as a new RF when its implementation starts (see § 4).

## 10. Glossary

- **User** — a user account; authenticates, publishes posts, comments. Attributes: `id, email, password, name, bio?, verified` (see `prisma/schema.prisma`).
- **Session** — a User's auth session, with `accessToken`/`refreshToken`. Attributes: `id, userId, accessToken, refreshToken` (see `prisma/schema.prisma`).
- **Post** — content published by a User. Attributes: `id, userId, title, content` (see `prisma/schema.prisma`).
- **Comment** — a User's comment on a Post. Attributes: `id, postId, userId, content` (see `prisma/schema.prisma`).
- **VerificationToken** — a User's email verification token, with expiry and single use. Attributes: `id, token, expiresAt, userId, used` (see `prisma/schema.prisma`).
- **ResetToken** — a User's password reset token, with expiry and single use. Attributes: `id, token, expiresAt, userId, used` (see `prisma/schema.prisma`).

## 11. Naming — product vs technical identifiers

- **User-facing product:** "Bearboo" — use in UI, emails, titles, external copy.
- **Technical identifiers do NOT change:**
  - `src/config/site.ts` still has the placeholder `"Next.js + HeroUI"` — [A DEFINIR: update to the real product name].
  - Other technical identifiers (paths, env vars) not inventoried in this retroactive adoption — they grow on demand.

---

*Current state and living history in `/docs/ust.md` (backlog) and `/docs/ach.md` (architecture). Process decisions in `/docs/afm.md`.*
