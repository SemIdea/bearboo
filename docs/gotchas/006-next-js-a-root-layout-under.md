---
type: gotcha
description: 'Next.js — a root layout under a dynamic segment leaves `_not-found` orphaned'
load: warm
fires_on: event
fires_when: 'if you delete `app/layout.tsx` and move `<html>`/`<body>` to a dynamic segment (e.g. `app/[lang]/layout.tsx`).'
---

# Next.js — a root layout under a dynamic segment leaves `_not-found` orphaned

**Trigger:** if you delete `app/layout.tsx` and move `<html>`/`<body>` to a dynamic segment (e.g. `app/[lang]/layout.tsx`).

**Behavior:** Next generates an internal route `/_not-found` that lives outside the dynamic segment, with no root layout to compose the document.

**Solution:** `app/global-not-found.tsx` + `experimental.globalNotFound: true`. Does not apply to Bearboo today (no `[lang]` routes), but is registered in case i18n enters scope.
-->



*To add a new gotcha: copy the format above. Place it in alphabetical order by area. If there is no area for it, create a new H2 section.*
