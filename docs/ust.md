# UST — User Stories

> Live backlog of stories. Every new feature/change starts as a US.
> Status flows: `draft` → `ready` → `in_progress` → `done` (or `cancelled` with a reason).
>
> The stories below were **reverse-engineered from existing tests** (`controller.test.ts`) during the retroactive adoption via `/afm:refactor` on 2026-06-30. Persona is `[A DEFINIR]` — comes from the interview.

## Conventions

- **ID:** `US-NNN` (3 digits, zero-padded — `US-001` through `US-999`).
- **Cross-reference:** always by ID (`RF-NN`, `RNF-NN`, `US-NNN`).
- **Criteria:** Gherkin (`Given/When/Then`). 1+ scenario per US.
- **Status:** updated in place in the commit that changes the real state.

## Summary

| ID | Title | Category | RF | Status |
| --- | --- | --- | --- | --- |
| US-001 | User registration | Authentication | RF-01 | done |
| US-002 | Login and session creation | Authentication | RF-01 | done |
| US-003 | Session refresh and logout | Authentication | RF-01 | done |
| US-004 | Email verification via token | Authentication | RF-02 | done |
| US-005 | Password recovery via token | Authentication | RF-03 | done |
| US-006 | Create and read post | Posts | RF-04 | done |
| US-007 | Update, revalidate (ISR), and delete post | Posts | RF-04 | done |
| US-008 | Create, list, update, and delete comment | Comments | RF-05 | done |
| US-009 | View and edit user profile | Profile | RF-06 | done |
| US-010 | Act according to role (Admin/Editor/Author) | Authentication | RF-08 | done |
| US-011 | Publish post via review workflow | Posts | RF-09 | done |
| US-012 | Share and index post with full SEO | Posts | RF-10 | done |
| US-013 | Search posts by title or content | Posts | RF-11 | done |
| US-014 | View analytics per post | Analytics | RF-12 | done |
| US-015 | Author/Editor customizes post SEO and friendly URL | Posts | RF-10 | done |
| US-016 | Authenticated user uploads and manages media | Media | RF-13 | done |
| US-017 | Dev resolves domain error without duplicated code per procedure | System Quality | RF-14 | done |
| US-018 | Dev observes one structured log line per operation | System Quality | RF-14 | done |

## Technical Pending Items

- **Infra/transient errors fall into `kind=bug`.** The boundary classification (ADR-0018/0022) is binary — a recoverable `AppError` vs. a bug. A `PrismaClientInitializationError` (database unreachable — observed live on 2026-08-25 on `post.readRecent`) is neither a code defect nor a business `AppError`, so the canonical line tags it `kind=bug retryable=false`; semantically it is **infra/transient and retryable**. The log still captures the full error (level `error` + stack); only the `kind`/`retryable` fields mislead. Revisit when retry or alerting needs the distinction — a 3rd category (`infra`/`transient`) or a driver retryable hint. Out of scope for `025-structured-logging`; touches ADR-0018 (hard rule 11). Candidate follow-up `026-infra-error-classification`.
- ~~Investigate whether the same pluggable-transport pattern used in the mailer can be applied to Prisma, to reduce duplication between runtime, tests, and other adapters.~~ **Resolved on 2026-07-06** — adopted `prisma-mock` (a PrismaClient fake generated from the schema) at the driver seam; hand-written fakes in `src/test/repositories/` deleted. See ADR-0011 and `docs/research/001-teste-prisma-sem-banco-real.md`.
- ~~Investigate why the token sent in emails does not work when the link is opened. The registration/verification flow seems to build the link correctly, but the final route does not complete the expected action.~~ **Resolved on 2026-07-11** — mismatch bug between the built link (`?token=`, query param) and the route `src/app/(smal)/auth/verify/[token]/page.tsx` (path param); fixed in `register.ts` and `resendVerificationEmail.ts` to build the link as `/auth/verify/${token}`, matching the pattern already used by the password reset flow (`sendResetPasswordEmail.ts`). Regression tests added in both `controller.test.ts` files.
- ~~`src/context/trpc/fetcher.ts` (`customFetcher`) reimplemented by hand the parsing of the `httpBatchLink` error envelope (array + `error.json.message` from superjson) to decide whether to refresh the session.~~ **Resolved on 2026-07-12** — logic moved to `src/context/trpc/sessionRefreshLink.ts`, a custom tRPC link (`opts.next(op)`) that receives the already-typed error (`TRPCClientError.data.code`/`.message`) instead of raw JSON; `fetcher.ts` deleted. See `docs/features/008-trpc-error-link/`. Treated as a standalone item (not folded into `001-auth-hardening`, which remains `draft` and covers a different security scope — see `008-trpc-error-link/spec.md` § 6).
- `/post/[slug]` (`docs/features/002-post-slug/`) now correctly calls `notFound()` when the slug does not exist (**2026-07-11**, previously it fell through to the generic `error.tsx` — see commit `a620cde`), but the HTTP status of the response is still `200`, not `404`. **Investigated and reclassified on 2026-07-12** (`docs/features/009-post-404-status/`): the original hypothesis ("taking the post out of the `<Suspense>` fixes it, at the cost of losing the loading fallback") **was wrong** — with `cacheComponents: true` (`next.config.ts`), Next.js requires a `<Suspense>` boundary around any uncached dynamic read; removing it breaks the entire `next build` (`Uncached data was accessed outside of <Suspense>`), it is not a UX trade-off. `export const dynamic = "force-dynamic"` no longer exists as an escape hatch (removed together with Cache Components in Next 16). See `docs/gotchas.md` § Cache Components. A real fix would require checking the slug **outside** the Cache Components pipeline (e.g. `middleware`/`proxy` on the Edge) — new infrastructure, not a point fix. **Owner decision (2026-07-12): accept as a known limitation for now**, without investing in the new infrastructure; reopen if it becomes a real blocker (e.g. SEO starts requiring a real 404). Relevant for roadmap Phase 5 (SEO) — bots that check HTTP status will not see a real 404.

---

## Authentication Epic

### US-001 — [Persona] registers a new account

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want to create an account with email/password/name so I can publish posts and comment.

**Acceptance criteria:**

```gherkin
Scenario: Successful registration
  Given an email not yet registered
  When the user registers with a valid email, password, and name
  Then the account is created and a verification email is sent

Scenario: Verification email fails to send
  Given a valid registration
  When sending the verification email fails
  Then the registration still completes successfully (a send failure does not block signup)

Scenario: Email already registered
  Given an email that already exists
  When the user tries to register with that email
  Then the operation is rejected with a conflict error
```

**Metadata:** RF-01. *Test ref:* `src/server/features/user/register/controller.test.ts`.

---

### US-002 — [Persona] logs in

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want to log in with email/password so I can create an authenticated session.

**Acceptance criteria:**

```gherkin
Scenario: Login with valid credentials
  Given an existing user with the correct password
  When the user logs in
  Then a session is returned

Scenario: Login with a nonexistent user
  Given an email that is not registered
  When the user tries to log in
  Then the operation is rejected
```

**Metadata:** RF-01. *Test ref:* `src/server/features/user/login/controller.test.ts`. *Spec:* `docs/features/001-auth-hardening/spec.md`.

---

### US-003 — [Persona] refreshes or ends (logout) the session

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want my session to renew automatically, and I want to be able to log out explicitly.

**Acceptance criteria:**

```gherkin
Scenario: Refresh of a valid session
  Given an existing session with a valid refresh token
  When the client requests a refresh
  Then a new session is issued

Scenario: Refresh with an invalid token
  Given an invalid refresh token
  When the client requests a refresh
  Then the operation is rejected

Scenario: Logout
  Given an authenticated session
  When the user logs out
  Then the session is ended

Scenario: Logout with a nonexistent session or user
  Given a session or user that no longer exists
  When logout is requested
  Then the operation is rejected with the appropriate error
```

**Metadata:** RF-01. *Test ref:* `src/server/features/auth/session/controller.test.ts`. *Spec:* `docs/features/001-auth-hardening/spec.md`.

---

### US-004 — [Persona] verifies the account email

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want to verify my email via token to unlock the account, and resend the token if needed.

**Acceptance criteria:**

```gherkin
Scenario: Successful verification
  Given a valid, unused verification token
  When the user verifies the token
  Then the account is marked as verified

Scenario: Token not found / already used / expired
  Given an invalid, already-used, or expired token
  When the user tries to verify
  Then the operation is rejected with the corresponding error

Scenario: Resend of a verification token
  Given an unverified user
  When the user requests a resend
  Then a new verification email is sent

Scenario: Resend with a nonexistent email
  Given an email that is not registered
  When a resend is requested
  Then the operation is rejected
```

**Metadata:** RF-02. *Test ref:* `src/server/features/auth/verifyToken/controller.test.ts`.

---

### US-005 — [Persona] recovers a forgotten password

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want to request a password reset by email and set a new password via token.

**Acceptance criteria:**

```gherkin
Scenario: Successful reset request
  Given an existing user
  When the user requests a password reset
  Then a reset token is created and an email is sent

Scenario: Request with a nonexistent user
  Given an email that is not registered
  When the reset is requested
  Then the operation is rejected

Scenario: Successful password reset
  Given a valid reset token and matching passwords
  When the user sets the new password
  Then the password is updated

Scenario: Reset with an invalid, used, or expired token, or mismatched passwords
  Given any of these conditions
  When the user tries to reset
  Then the operation is rejected with the corresponding error
```

**Metadata:** RF-03. *Test ref:* `src/server/features/auth/resetToken/controller.test.ts`.

---

### US-010 — [Persona] acts according to their role (Admin/Editor/Author)

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]` with a role (`ADMIN`/`EDITOR`/`AUTHOR`), I want the system to only let me do what my role allows — and let Admin/Editor act on any user's content, while Author can only act on their own.

**Acceptance criteria:**

```gherkin
Scenario: Admin edits another user's post
  Given a post belonging to another user
  When an Admin calls the edit
  Then the operation is accepted

Scenario: Author tries to edit another user's post
  Given a post belonging to another user
  When an Author (not the owner) calls the edit
  Then the operation is rejected

Scenario: Author creates a category
  Given a user with the Author role
  When they try to create a category
  Then the operation is rejected

Scenario: Admin promotes another user
  Given a user with the Admin role
  When they change another user's role
  Then the role is updated
```

**Metadata:** RF-08. *Test ref:* `src/lib/permissions/__test__/matrix.ts`, `src/server/features/post/domain/__test__/*`, `src/server/features/category/procedures/__test__/create.ts`, `src/server/features/user/procedures/__test__/updateRole.ts`. *Spec:* `docs/features/013-role-based-permissions/spec.md`.

---

## Posts Epic

### US-011 — [Persona] publishes a post via review workflow

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]` with a role (`ADMIN`/`EDITOR`/`AUTHOR`), I want publishing a post to follow a review workflow — Author submits for review, Admin/Editor approves/rejects/publishes/schedules/archives — instead of any owner freely publishing/archiving their own post.

**Acceptance criteria:**

```gherkin
Scenario: Author creates a post and it starts as DRAFT
  Given a user with the AUTHOR role
  When they create a post without specifying a status
  Then the post is persisted as DRAFT

Scenario: Author submits their own draft for review
  Given a DRAFT post belonging to the logged-in user
  When they submit the post for review
  Then the post becomes IN_REVIEW

Scenario: Editor approves and publishes a post under review
  Given an IN_REVIEW post
  When an Editor approves the post without a scheduled date
  Then the post becomes PUBLISHED immediately

Scenario: Admin schedules the publication of a post under review
  Given an IN_REVIEW post
  When an Admin approves the post with a future date
  Then the post becomes SCHEDULED, and only appears publicly once that date arrives

Scenario: Editor rejects a post under review with a reason
  Given an IN_REVIEW post
  When an Editor rejects it with a reason
  Then the post goes back to DRAFT and the reason is visible to the owner

Scenario: Admin archives another user's post
  Given a post belonging to another user
  When an Admin archives the post
  Then the post becomes ARCHIVED

Scenario: Author tries to publish or archive their own post directly
  Given a post belonging to the logged-in user (AUTHOR role)
  When they try to publish or archive that post directly
  Then the operation is rejected (FORBIDDEN)
```

**Metadata:** RF-09. *Test ref:* `src/server/features/post/procedures/__test__/{submitForReview,publish,reject,archive,readReviewComments}.ts`. *Spec:* `docs/features/014-post-review-workflow/spec.md`.

---

### US-012 — [Persona] shares and indexes a post with full SEO

- **Persona:** `[A DEFINIR]` (external reader/search engine — not an authenticated role in the system).
- **Story:** As a reader sharing a post link (Discord/LinkedIn/WhatsApp) or as a search engine indexing the site, I want every published post to have complete metadata (canonical, Open Graph with image, Twitter Card, schema.org) and the site to expose sitemap/robots/RSS, so previews are rich and indexing works.

**Acceptance criteria:**

```gherkin
Scenario: Sitemap lists only publicly visible posts
  Given a PUBLISHED post, a DRAFT, an IN_REVIEW, an ARCHIVED, a SCHEDULED post in the future, and a SCHEDULED post in the past
  When the sitemap is generated
  Then only the PUBLISHED post and the past SCHEDULED post appear

Scenario: Robots.txt blocks private routes
  When robots.txt is generated
  Then the create/edit/my-posts, profile, auth, and api routes appear under Disallow
  And robots.txt references the sitemap URL

Scenario: RSS feed reflects recently published posts
  Given 3 PUBLISHED posts and 1 DRAFT
  When feed.xml is read
  Then it contains the 3 published posts, and does not contain the DRAFT

Scenario: Shared post has a rich preview
  Given a PUBLISHED post with a cover image
  When the post page is loaded
  Then the metadata includes canonical, Open Graph with image, Twitter Card summary_large_image, and valid JSON-LD Article
```

**Metadata:** RF-10. *Test ref:* `src/server/models/__test__/prismaModels.ts` (`readAllPublicSlugs`), `src/server/features/post/procedures/__test__/readSitemapEntries.ts`, `src/server/http/__test__/{buildRssXml,buildArticleJsonLd}.ts`. *Spec:* `docs/features/015-seo-metadata/spec.md`.

---

### US-013 — [Persona] searches posts by title or content

- **Persona:** `[A DEFINIR]` (public blog reader — not an authenticated role in the system).
- **Story:** As a reader browsing the blog, I want to search posts by a keyword present in the title or content, with suggestions as I type, so I can find a specific post without scrolling the chronological listing.

**Acceptance criteria:**

```gherkin
Scenario: Search finds a post by title
  Given a PUBLISHED post titled "Guia de Prisma"
  When the reader searches for "prisma"
  Then the post appears in the results

Scenario: Search finds a post by content
  Given a PUBLISHED post whose content mentions "tsvector" but the title does not
  When the reader searches for "tsvector"
  Then the post appears in the results

Scenario: Search does not leak non-public posts
  Given a DRAFT post titled "Rascunho Secreto"
  When the reader searches for "secreto"
  Then the post does not appear in the results

Scenario: Search is paginated
  Given 15 PUBLISHED posts whose title contains "teste"
  When the reader searches for "teste" with limit 10
  Then the first page returns 10 posts and a non-null nextCursor

Scenario: Search sorted by most viewed
  Given a PUBLISHED post titled "A" with viewCount 5
  And a PUBLISHED post titled "B" (same search term) with viewCount 20
  When the reader searches for the shared term with sortBy "mostViewed"
  Then post "B" appears before post "A"
```

**Metadata:** RF-11. *Test ref:* `src/server/features/post/procedures/__test__/search.ts`, `src/server/models/__test__/prismaModels.ts` (`search`). *Spec:* `docs/features/016-search-content/spec.md`, `docs/features/019-search-sort-by-views/spec.md`.

---

### US-014 — Admin/Editor tracks post views

- **Persona:** Admin/Editor (authenticated role in the system, see `013-role-based-permissions`).
- **Story:** As an Admin/Editor, I want to see how many views each post received (total and a ranking of most viewed), from views recorded automatically when a reader opens a post's public page, so I can understand which content performs best.

**Acceptance criteria:**

```gherkin
Scenario: A view of a public post is recorded
  Given a PUBLISHED post
  When a reader opens the post page
  Then a view is recorded for that post

Scenario: A view of a non-public post is not recorded
  Given a DRAFT or ARCHIVED post
  When someone opens the post URL (e.g. the owner's own preview)
  Then no public view is recorded for that access

Scenario: Admin/Editor sees the total view count of a post
  Given a post with N recorded views
  When an Admin/Editor opens the analytics dashboard
  Then the total view count for that post appears

Scenario: Dashboard lists the most viewed posts
  Given multiple posts with different view counts
  When an Admin/Editor opens the analytics dashboard
  Then the posts appear sorted by view count, from most to least viewed

Scenario: Dashboard is restricted to Admin/Editor
  Given an authenticated Author user (without the Admin/Editor role)
  When they try to access the analytics dashboard
  Then access is denied

Scenario: Dashboard shows views for the last 7 and 30 days
  Given a post with views recorded on different dates, some more than 30 days old
  When an Admin/Editor opens the analytics dashboard
  Then the dashboard shows the view count for the last 7 days and the last 30 days
  And views older than 30 days are not included in those counts

Scenario: Dashboard shows traffic source
  Given visits with a search-engine Referer header, a social-network Referer, no Referer (direct), and another site's Referer
  When an Admin/Editor opens the analytics dashboard
  Then the dashboard shows the view count per source category (direct/search/social/other)

Scenario: Dashboard shows a browser/OS breakdown
  Given visits from different User-Agents
  When an Admin/Editor opens the analytics dashboard
  Then the dashboard shows the view count per recognized browser/OS

Scenario: Old views no longer count toward the breakdown (retention)
  Given a view recorded more than 30 days ago
  When the analytics dashboard is read again
  Then that view does not appear in any breakdown and is not counted in the period metrics
```

**Metadata:** RF-12. *Test ref:* `src/server/features/analytics/domain/__test__/{recordView,readDashboard}.ts`, `src/server/features/analytics/procedures/__test__/{recordView,readDashboard}.ts`, `src/server/integrations/gateway/viewCounter/implementations/__test__/{redis,inMemory}.ts`, `src/server/models/__test__/postView.ts`, `src/lib/{referrerClassifier,userAgentClassifier}/__test__/regex.ts`. *Spec:* `docs/features/017-post-view-analytics/spec.md`, `docs/features/020-view-analytics-breakdown/spec.md`.

---

### US-015 — Author/Editor customizes post SEO and friendly URL

- **Persona:** Author/Editor (post owner or anyone with `post:editAny` — same rule as `post.update` today).
- **Story:** As an Author/Editor, I want to be able to override the title/description/canonical used in a post's SEO (when the title/content are not ideal for sharing, or the post is republished from elsewhere), and to be able to fix the slug of an already-published post without breaking old links, so I have full editorial control over how the post is indexed and shared (`docs/roadmap.md` Phase 5, items deferred in `015-seo-metadata/spec.md § 4`).

**Acceptance criteria:**

```gherkin
Scenario: SEO override is used in metadata instead of the post's content
  Given a post with seoTitle/seoDescription/canonicalUrl filled in
  When the post page is loaded
  Then <title>, meta description, Open Graph, and canonical use the override values, not the post's own title/content/URL

Scenario: Without an override, current behavior is preserved
  Given a post without seoTitle/seoDescription/canonicalUrl (empty fields)
  When the post page is loaded
  Then the metadata is computed from the post's own title/content/URL, same as before 018

Scenario: Editing a post's slug generates a new, valid, unique slug
  Given an existing post with slug "como-fiz-x"
  When the Author/Editor edits the slug to "como-fiz-x-de-verdade"
  Then the post now responds at "/post/como-fiz-x-de-verdade"
  And the old slug "como-fiz-x" is recorded as a previous slug

Scenario: The old slug redirects to the new slug
  Given a post whose slug changed from "como-fiz-x" to "como-fiz-x-de-verdade"
  When someone accesses "/post/como-fiz-x"
  Then the response is a permanent redirect (301) to "/post/como-fiz-x-de-verdade"

Scenario: The new slug collides with an existing one
  Given a published post with slug "titulo-legal"
  When the Author/Editor edits another post to the same slug "titulo-legal"
  Then the edited post receives a numeric suffix ("titulo-legal-2"), the same pattern used for slug generation at creation time
```

**Metadata:** RF-10. *Test ref:* `docs/features/018-seo-overrides-slug-redirect/`. *Spec:* `docs/features/018-seo-overrides-slug-redirect/spec.md`.

---

### US-006 — [Persona] creates and reads posts

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want to publish a post and be able to read it (individually or among recent posts).

**Acceptance criteria:**

```gherkin
Scenario: Create a post
  Given an authenticated, verified user
  When the user creates a post with a title and content
  Then the post is persisted with the author's `userId`

Scenario: Read a post by ID
  Given an existing post
  When the post is read by ID
  Then the post data is returned

Scenario: Read a nonexistent post
  Given an ID that does not exist
  When the post is read
  Then the operation is rejected

Scenario: List recent posts
  When recent posts are requested
  Then up to 30 recent posts are returned

Scenario: Read a post by slug
  Given an existing post with slug "como-fiz-x"
  When the post is read by the slug "como-fiz-x"
  Then the post data is returned

Scenario: Read a post by a nonexistent slug
  Given a slug that does not match any post
  When the post is read by that slug
  Then the operation is rejected with "post not found"

Scenario: Creating a post generates a slug derived from the title
  Given an authenticated, verified user
  When they create a post titled "Como fiz X"
  Then the persisted post has a slug in the format "como-fiz-x"

Scenario: A duplicate title generates a slug with a suffix
  Given an existing post with slug "como-fiz-x"
  When a new post is created with the same title "Como fiz X"
  Then the new post receives the slug "como-fiz-x-2"
```

**Metadata:** RF-04. *Test ref:* `src/server/features/post/create/controller.test.ts`, `post/read`, `post/readRecent`, `post/readBySlug`. *Spec:* `docs/features/002-post-slug/spec.md` (amend — read by slug, `in_progress`).

---

### US-007 — [Persona] updates, revalidates, and deletes a post

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want to edit, revalidate (ISR), or remove my own posts.

**Acceptance criteria:**

```gherkin
Scenario: Update own post
  Given a post belonging to the authenticated user
  When the user updates the title/content
  Then the post is updated

Scenario: Update another user's post
  Given a post that does not belong to the authenticated user
  When the user tries to update it
  Then the operation is rejected as unauthorized

Scenario: Revalidate a post (ISR)
  Given a post belonging to the user
  When the user requests revalidation
  Then the post page is revalidated

Scenario: Delete own post
  Given a post belonging to the user
  When the user deletes it
  Then the post is removed

Scenario: Nonexistent post or another user's post
  Given these conditions in update/revalidate/delete
  When the operation is attempted
  Then it is rejected with the corresponding error
```

**Metadata:** RF-04. *Test ref:* `src/server/features/post/update`, `post/revalidate`, `post/delete` `controller.test.ts`.

---

## Comments Epic

### US-008 — [Persona] comments on posts

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want to create, list, update, and delete comments on posts.

**Acceptance criteria:**

```gherkin
Scenario: Create a comment
  Given an authenticated user and an existing post
  When the user comments
  Then the comment is persisted

Scenario: List comments on a post
  Given a post with or without comments
  When the comments are listed
  Then the list (or an empty list) is returned

Scenario: Update own comment
  Given a comment from the authenticated user
  When the user updates the content
  Then the comment is updated

Scenario: Delete own comment
  Given a comment from the authenticated user
  When the user deletes it
  Then the comment is removed

Scenario: Nonexistent comment or another user's comment
  Given these conditions in update/delete
  When the operation is attempted
  Then it is rejected with the corresponding error
```

**Metadata:** RF-05. *Test ref:* `src/server/features/comment/{create,readAll,update,delete}/controller.test.ts`.

---

## User Profile Epic

### US-009 — [Persona] views and edits their own profile

- **Persona:** `[A DEFINIR]`.
- **Story:** As a `[persona]`, I want to see my profile (with posts/comments) and edit my name/bio.

**Acceptance criteria:**

```gherkin
Scenario: Read a user's profile
  Given an existing user
  When the profile is requested
  Then the profile data is returned

Scenario: Profile of a nonexistent user
  Given an ID that does not exist
  When the profile is requested
  Then the operation is rejected

Scenario: Update own profile
  Given an authenticated user
  When the user updates name/bio
  Then the profile is updated

Scenario: List a user's posts
  Given a user with or without posts
  When the user's posts are requested
  Then the list (or an empty list) is returned

Scenario: List a user's comments
  Given a user with or without comments
  When the user's comments are requested
  Then the list (or an empty list) is returned
```

**Metadata:** RF-06. *Test ref:* `src/server/features/user/{profile,posts,comments}/controller.test.ts`.

---

## Media Epic

### US-016 — Authenticated user uploads and manages media

- **Persona:** Author/Editor/Admin (any authenticated user, see `013-role-based-permissions`).
- **Story:** As an authenticated user, I want to upload an image file, see my media library, delete what I uploaded, and describe the image with alt text, so I can use my own image as a post cover without depending on an external URL (`docs/roadmap.md` Phase 8). Admin/Editor can also see and remove media uploaded by any user, the same bypass pattern as `post:deleteAny` (RF-08).

**Acceptance criteria:**

```gherkin
Scenario: Upload a valid image
  Given an authenticated user
  When they upload a 2MB JPEG file with alt text "foto do evento"
  Then the media is saved and appears in the user's library with the public URL

Scenario: Upload rejected due to invalid format
  Given an authenticated user
  When they upload a .pdf file
  Then the upload is rejected before touching storage

Scenario: Upload rejected due to size limit exceeded
  Given an authenticated user
  When they upload an 8MB image (above the configured limit)
  Then the upload is rejected before touching storage

Scenario: User sees only their own library
  Given two users, each with uploaded media
  When one of them lists their own library
  Then only the media they uploaded themselves appears

Scenario: Owner deletes their own media
  Given a user who owns a media item
  When they delete that media
  Then the record and the physical file no longer exist

Scenario: User without permission cannot delete another user's media
  Given an Author user without a permission bypass
  When they try to delete media uploaded by another user
  Then the operation is rejected

Scenario: Admin/Editor deletes any user's media
  Given a user with the Admin or Editor role
  When they delete media uploaded by another user
  Then the media is removed normally

Scenario: Uploaded media becomes a post cover
  Given a user with already-uploaded media
  When they choose that media as the cover while creating/editing a post
  Then the post starts using the media's public URL as coverImageUrl
```

**Metadata:** RF-13. *Spec:* `docs/features/021-media-upload/spec.md`.

---

## System Quality Epic

### US-017 — Dev resolves domain error without duplicated code per procedure

- **Persona:** Dev maintaining the project (internal quality item, not a product item — `docs/roadmap.md` Phase 9).
- **Story:** As a dev maintaining the backend, I want every domain error to already carry its own HTTP code and message (via `ErrorRegistry`, `ADR-0017`), so I can write/read any procedure without a repeated switch/if-chain translating `AppError` into `TRPCError`, and without losing the granularity that the frontend (`getErrorMessage`) already relies on to show the right message.

**Acceptance criteria:**

```gherkin
Scenario: Domain throws a namespaced error and the procedure translates nothing
  Given a domain_* function that detects a business-rule violation
  When it throws `new AppError("auth.invalid_credentials")`
  Then the procedure carries no translation block at all — no switch, no if-chain, no try/catch
  And the baseProcedure middleware re-throws a TRPCError with the transport code (appErrorTransport) and message (resolveErrorEntry) resolved outside the domain

Scenario: Two domains cannot claim the same namespace
  Given two different error files calling defineDomainErrors with the same domain name
  When the second module is loaded
  Then ErrorRegistry throws a duplication error, failing the boot instead of silently overwriting

Scenario: A typo in the error code breaks the build, not the runtime
  Given a domain_* referencing an AppError with a code that does not exist in the registry
  When the project runs tsc --noEmit
  Then the build fails, because ErrorCode is the literal union derived from keyof typeof Errors

Scenario: Frontend keeps resolving the right message by granular code
  Given multiple domain errors that map to the same httpCode (e.g. several BAD_REQUEST in auth)
  When each of them occurs
  Then the frontend shows the correct specific message, not a generic status message
```

**Metadata:** RF-14. *Spec:* `docs/features/022-error-registry/spec.md`; extended by `023-error-metadata-classification` and **effectively closed** by `024-error-boundary-centralization` (2026-08-22) — 022 delivered the registry, but the duplication the story refers to ("without repeated switch/if-chain") only left the code in 024, when the translation became middleware. See ADR-0019.

---

*Adding a new US: copy the block above below the corresponding epic. If the epic does not exist, create a new H2. Number the ID sequentially from the last one in use.*
