# 🐻 Bearboo

A technical blog / CMS built as a full-stack engineering study — a real,
maintainable application rather than "just another blog." The focus is on a clean
layered backend, business rules, and production practices (tests, structured
logging, CI, native search).

> Content locale is **en-US** today; a language system (pt-BR + en-US) is planned.

---

## Stack

- **Next.js 16** (App Router), **TypeScript**
- **tRPC v11** — end-to-end type-safe API
- **Prisma 6** + **PostgreSQL 16**
- **Redis** (ioredis 6) — session cache + view-count dedup
- **Zod** — boundary validation
- **Vitest** — unit + integration; **Testcontainers** for real-Postgres integration
- **Biome** — lint/format · **Docker** · **GitHub Actions** CI · **Vercel** deploy

## Features

- **Public blog** — posts by slug, cursor pagination, tags/categories, reading time, related posts, cover image.
- **Admin/CMS** — create/edit/delete, draft preview on the real URL, "my posts" panel with filters.
- **Auth & roles** — custom sessions (server-side expiry, `HttpOnly`, rate-limited), `ADMIN`/`EDITOR`/`AUTHOR`.
- **Editorial workflow** — draft → in-review → scheduled/published, approve/reject, review comments.
- **SEO** — sitemap, robots, RSS, canonical, Open Graph / Twitter Card, schema.org, editable slug with 301 redirect.
- **Native full-text search** — Postgres `tsvector`/`ts_rank` with relevance ranking (title weighted above content) and English stemming.
- **Internal analytics** — view counts (Redis-backed dedup), breakdown by period / traffic source / browser, admin dashboard.
- **Media** — image upload, library, alt text, format/size validation.
- **Observability** — one structured canonical log line per request (JSON in prod, pretty in dev).

## Architecture

A layered backend with explicit dependency injection via the tRPC context:

```
Route handler (src/app/api) → Procedure (tRPC) → Domain (domain_<action>) → Model (Prisma)
```

Domains and procedures never touch the Prisma driver directly — they go through
`ctx.repositories`, so the same code runs in tests against an in-memory
`prisma-mock` (unit) or a real Postgres (integration). See
[`docs/ach.md`](./docs/ach.md) for the component map and
[`docs/adr/`](./docs/adr/) for the decisions behind it.

---

## Run locally (development)

Requires **Node 20+** and **Docker**.

1. **Start Postgres + Redis:**

   ```bash
   npm run docker:dev        # docker compose -f docker-compose-dev.yml up
   ```

2. **Configure env:** copy `.env.example` to `.env` and fill it in. For the dev
   containers above:

   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
   REDIS_URL="redis://localhost:6379/0"
   SITE_URL="http://localhost:3000"
   ```

3. **Install, migrate, seed:**

   ```bash
   npm install
   npx prisma migrate deploy   # apply migrations — NOT `db push` (see the note below)
   npm run db:seed             # optional sample data
   ```

4. **Run:**

   ```bash
   npm run dev                 # http://localhost:3000
   ```

> **Migrations:** always use `prisma migrate deploy`. `prisma db push` /
> `prisma migrate dev` fail on the generated `tsvector` search column and can
> leave a phantom failed migration — see
> [`docs/gotchas.md`](./docs/gotchas.md) (Prisma — `Unsupported` generated column).

### Full stack via Docker (production-like)

```bash
npm run docker:start          # app + Postgres + Redis + nginx → http://localhost:4000
```

## Tests

```bash
npm test                      # unit — fast, prisma-mock, no database needed
npm run test:integration      # integration — real Postgres via Testcontainers (needs Docker)
```

> The integration suite needs **Node ≥ 22.19** (Testcontainers pulls `undici@8`,
> which requires it). The unit suite runs on Node 20. See
> [`docs/adr/0026-integration-tests-testcontainers.md`](./docs/adr/0026-integration-tests-testcontainers.md).

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate && prisma migrate deploy && next build` |
| `npm start` | Next.js production server |
| `npm test` | unit tests (Vitest, prisma-mock) |
| `npm run test:integration` | integration tests (Testcontainers + real Postgres) |
| `npm run lint` | Biome check + format |
| `npm run db:seed` | seed sample data |
| `npm run docker:dev` | Postgres + Redis for local dev |
| `npm run docker:start` | full stack (app + nginx) via Docker |

## Environment variables

Key variables (see `.env.example` for the full list): `DATABASE_URL`,
`REDIS_URL`, `SITE_URL`, `MAIL_*` (SMTP), `MEDIA_UPLOAD_DIR` /
`MEDIA_MAX_UPLOAD_SIZE_BYTES`. `DISABLE_REDIS=true` skips Redis (used in CI).

---

## Documentation

The living source of truth is [`/docs/`](./docs/): product ([`prd.md`](./docs/prd.md),
[`ust.md`](./docs/ust.md)), architecture ([`ach.md`](./docs/ach.md)), decisions
([`adr/`](./docs/adr/)), gotchas ([`gotchas.md`](./docs/gotchas.md)), the phase plan
([`roadmap.md`](./docs/roadmap.md)), and the working methodology ([`afm.md`](./docs/afm.md)).

## License

[MIT](./LICENSE).

## Contact

[GitHub — @SemIdea](https://github.com/SemIdea)
