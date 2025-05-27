User:
  UI:
    - [x] Login page (`/auth/login`)
    - [x] Register page (`/auth/register`)
    - [ ] Logout trigger (button/action)
  Server:
    - [x] Login (features/user/login)
    - [x] Register (features/user/register)
    - [ ] Logout (features/auth/session)

Post:
  UI:
    - [x] Create page (`/post/create`)
    - [x] Edit page (`/post/edit/[id]`)
    - [ ] Read single post page (`/post/[id]`)
      - [ ] Handle when post not found
    - [ ] Delete (button component)
    - [x] List page or feed (postFeed component)
  Server:
    - [x] Create
    - [x] Read (single)
    - [x] Update
    - [x] Delete
    - [x] List (findAll)

Session:
  Server:
    - [x] Session management (create, validate, features/auth/session)
    - [ ] Logout (invalidate token/session, features/auth/session)
    - [x] Refresh token (features/auth/session)

Infrastructure:
  - [x] Prisma setup
  - [x] Redis setup
  - [x] TRPC integration
  - [x] Snowflake ID generator
  - [x] Password hashing adapter (bcrypt)
  - [x] Cache adapter (Redis)

Context:
  - [x] Auth context
  - [x] Post context
  - [x] TRPC context

Shared:
  - [x] Auth error definitions
  - [ ] Generic error display component (for fullstack errors)
  - [x] Auth storage utils

Testing:
  - [x] Register controller test
  - [ ] Add more feature/service layer tests
  - [ ] Add UI tests (optional)