---
type: gotcha
description: 'Next.js — `cookies()` / `headers()` only in a Server Component / route handler'
load: warm
fires_on: event
fires_when: 'if you are using `cookies()` or `headers()` from `next/headers` in a pure lib or a Client Component.'
---

# Next.js — `cookies()` / `headers()` only in a Server Component / route handler

**Trigger:** if you are using `cookies()` or `headers()` from `next/headers` in a pure lib or a Client Component.

**Behavior:** both work only in the request context — Server Component, route handler, server action. Anywhere else they throw at runtime.

**Solution:** read cookies in the Server Component / route handler, pass them to the client component as a prop. Never import `next/headers` in code that can run in the browser.

**Ref:** confirmed by the team in the retroactive adoption (`/afm:refactor`, 2026-06-30) as already bitten.
