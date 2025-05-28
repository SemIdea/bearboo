### User
UI:
- [x] Login page (`/auth/login`)
- [x] Register page (`/auth/register`)
- [x] Logout button/action
- [ ] Profile page (`/user/[id]`)
- [ ] Navigation header component (shows auth state)
- [ ] Password reset page (UI only)

Server:
- [x] Login controller
- [x] Register controller
- [x] Logout endpoint
- [ ] Get user profile data
- [ ] Password reset endpoint
- [ ] Protected routes middleware
- [ ] Session expiration handling

---

### Post
UI:
- [x] Create page (`/post/create`)
- [x] Edit page (`/post/edit/[id]`)
- [x] Single post page (`/post/[id]`)
- [x] Delete button component
- [x] Post feed component
- [ ] Homepage feed (`app/page.tsx`)
- [ ] Edit/Delete buttons visibility (owner only)
- [ ] Draft/Published status toggle UI
- [ ] Category/tag input field

Server:
- [x] Create controller
- [x] Read (single) controller
- [x] Update controller
- [x] Delete controller
- [x] List (findAll) controller
- [ ] Ownership verification
- [ ] Status filtering (draft/published)
- [ ] Category/tag storage
- [ ] Pagination logic

---

### Session
UI: (None - purely server feature)

Server:
- [x] Session creation
- [x] Session validation
- [x] Refresh token
- [ ] Complete logout (token invalidation)
- [ ] Token expiration enforcement
- [ ] Rate limiting (authentication endpoints)
- [ ] Concurrent session prevention

---

### Infrastructure
UI: (None - backend only)

Server:
- [x] Prisma setup
- [x] Redis integration
- [x] TRPC setup
- [x] Snowflake ID generator
- [x] Password hashing
- [x] Cache adapter
- [ ] Input validation (Zod integration)
- [ ] Content sanitization (XSS prevention)
- [ ] Pagination implementation
- [ ] HTTPS enforcement (production)

---

### Layout (New Section)
UI:
- [ ] Main navigation header
- [ ] Footer component
- [ ] Layout wrapper (persistent across pages)
- [ ] Responsive mobile menu

Server: (None)

---

### Error Handling
UI:
- [ ] Global error display component
- [ ] Not Found page component
- [ ] Loading spinner component
- [ ] Form validation messages

Server:
- [x] Auth error definitions
- [ ] Unified error formatting
- [ ] Error logging system

---

### Testing
UI:
- [ ] Auth flow test (login/logout)
- [ ] Post CRUD test cycle
- [ ] Ownership UI tests

Server:
- [x] Register controller test
- [ ] Auth flow endpoint tests
- [ ] Post CRUD endpoint tests
- [ ] Ownership verification tests