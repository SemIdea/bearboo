---
type: gotcha
description: 'Next.js — `revalidatePath` / `revalidateTag` does not invalidate React Query'
load: warm
fires_on: event
fires_when: 'if you are in a route handler or server action and want to refresh the client cache.'
---

# Next.js — `revalidatePath` / `revalidateTag` does not invalidate React Query

**Trigger:** if you are in a route handler or server action and want to refresh the client cache.

**Behavior:** `revalidatePath` invalidates the Next cache (RSC + fetch), but React Query on the client has its own cache. A mutation via a server action must also invalidate the query on the client — it does not arrive automatically.

**Solution:** return a signal to the client that triggers `queryClient.invalidateQueries(...)`. Or use a stack client that already integrates it (e.g. `@trpc/tanstack-react-query` invalidates automatically in `onSuccess`).

**Ref:** confirmed by the team in the retroactive adoption (`/afm:refactor`, 2026-06-30) as already bitten. See `src/server/features/post/procedures/revalidate.ts` + `src/server/features/post/domain/revalidate.ts` (ISR revalidation, per-feature structure from ADR-0006).
