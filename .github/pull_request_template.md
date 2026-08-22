<!-- Write the PR in English, title included (docs/afm.md rule 34).
     The title follows Conventional Commits: type(scope): short description
     (e.g. feat(error): add retryable metadata). -->

## What changed and why

<!-- The goal of the change, and why it is needed. Link docs/features/NNN-slug/
     if it exists (spec.md has the problem, plan.md has the decisions). -->

## How it works

<!-- What a reviewer needs to follow the diff: approach, trade-offs, anything
     non-obvious. Area by area, not file by file — the diff already shows files. -->

## What to review closely

<!-- The feedback you want and where. Deviations from the rules in docs/afm.md
     go here — name them, do not bury them. -->

## Verification

<!-- What you checked that a reviewer cannot see from the diff: manual steps,
     edge cases, screenshots for UI changes. The DoD ritual (docs/afm.md § 6)
     is `npx tsc --noEmit` + `yarn test` (+ `yarn build` if it touches routes).
     Also confirm no secret leaked:
     git diff develop... | grep -nE "(token|secret|api[_-]?key|password|bearer)\s*[:=]\s*['\"][^'\"]+"  # empty -->

## Out of scope / known debt

<!-- What was deliberately left out this round, and why. -->

## Refs

<!-- Closes #N — plus US-NNN, RF-NN, docs/features/NNN-slug/ -->
