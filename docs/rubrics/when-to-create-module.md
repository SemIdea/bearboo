# Rubric — when to create a top-level module in `server/modules/`

## Binary decision

**Create a new module when ALL are true:**

- ✅ It has its **own entity** (a new model, not a field on an existing model).
- ✅ It already has **≥ 2 procedures** foreseen (not 1 isolated one).
- ✅ It has **its own state with a lifecycle** (not just a static lookup table).

**Otherwise it is a sub-feature of an existing module.** E.g.: `notifications` that only serves `auth` lives as `src/server/modules/auth/notifications/`, not as a top-level module.

## Why these rules

- **Its own entity** defines the module's natural boundary. Without an entity, it is just another module's feature (a field, extra behavior).
- **≥ 2 procedures** ensures the module has enough usage surface. An isolated procedure does not justify its own directory + its own router + its own domain.
- **Lifecycle** distinguishes "a domain with state" from "static configuration". A plan (FREE/PRO) is an enum + a lookup table → it is not a `plans/` module, it is part of `billings/`.

## Before creating — a review question

1. Does this concept exist in a current module? If yes, it is a sub-feature.
2. Will it share `domain/`, `infra/`, or types with another module? If yes, consider `src/domain/shared/` instead of a new module.
3. Will it last > 6 months untouched? If yes and it does not grow, maybe it is just a helper, not a module.

## Anti-examples

- ❌ Creating `modules/notifications/` when only auth triggers a notification — it stays in `modules/auth/notifications/`.
- ❌ Creating `modules/plans/` to host the `PLAN_CONFIG` constant — it stays in `modules/billings/plan-config.ts`.
- ❌ Creating `modules/utils/` to aggregate cross-module helpers — there is no `utils` module, helpers go to `lib/` or inline.
- ❌ Creating `modules/admin/` early "because there will be an admin panel later" — YAGNI. Wait for the first admin procedure to appear.
