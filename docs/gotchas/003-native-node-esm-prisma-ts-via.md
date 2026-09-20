---
type: gotcha
description: 'Native Node ESM (`prisma/*.ts` via `node`) — you cannot re-import `src/lib/*`'
load: warm
fires_on: event
fires_when: 'if you are writing a script in `prisma/` (seed, manual test script, etc.) that runs via `node --env-file=.env prisma/algo.ts` — not via Next.js/webpack.'
---

# Native Node ESM (`prisma/*.ts` via `node`) — you cannot re-import `src/lib/*`

**Trigger:** if you are writing a script in `prisma/` (seed, manual test script, etc.) that runs via `node --env-file=.env prisma/algo.ts` — not via Next.js/webpack.

**Behavior:** `tsconfig.json` uses `moduleResolution: "bundler"`, which allows an extensionless relative import (`from "../adapter"`) across all of `src/`. Node's native TS execution does not accept it — it requires an extension on every relative import. A script in `prisma/` that imports something from `src/lib/` breaks as soon as that module (or anything it imports, in a chain) has an extensionless relative import — which is the whole project's default convention in `src/`. Bitten 2× (`prisma/seed.ts`, `2026-07-11`; `prisma/seed-pagination-test.ts`, `2026-07-12`) — both times the "solution" became duplicating the logic in the script, which in turn duplicated the duplication.

**Solution:** pure logic reused by `prisma/` scripts lives in `prisma/*.ts` (not in `src/`), with no relative import of its own (a leaf file) — so another `prisma/` script can import it with an explicit extension (`from "./slug.ts"`) without falling into the broken chain. It needs `"allowImportingTsExtensions": true` in `tsconfig.json` (safe with `noEmit: true`, which was already the case). See `prisma/slug.ts` (single source of `generateSlug`, used by `seed.ts` and `seed-pagination-test.ts`).

**Ref:** `docs/features/003-post-pagination/` (found while creating `seed-pagination-test.ts`, 2026-07-12).
