# Rubric — when to create a DSL (suggests, does not build)

> A DSL here = any mini domain language that collapses repeated boilerplate of primitive calls: a fluent builder, a combinator pipeline, an interpreted declarative object, or a parsed language. **DSL-first is the complement of the Rule of Three, not the opposite of KISS:** it does not abstract early — but when the primitive boilerplate scales AND has a grammar, a DSL pays its own cost. The agent **suggests** (proposes + sketches); it **does not build alone** (hard rule 11 — a DSL is a first-class layer/abstraction → stop and ask).

## Binary decision

**Suggest a DSL when BOTH signals are true (both, not one):**

- ✅ **Repetition (a Rule-of-Three of sequence):** ≥ 3 call sites repeat the **same sequence of ≥ N primitive calls in a fixed order** (not 3 loose calls — the *sequence* that repeats). Only the parameters vary, not the structure.
- ✅ **Boilerplate dominates the intent (ratio):** at those sites, most of the lines are mechanical wiring/setup/glue, not the real business logic — the reader cannot see *what* the code wants through the *how* it wires the primitives.

**And a third condition that distinguishes a DSL from "extract a function":**

- ✅ **There is a reusable grammar** — composition, mandatory ordering, branching, or chaining that repeats. That is what makes a DSL pay more than a helper. Without a grammar (just "call 5 functions in the same sequence every time"), **a named helper wins** — it is not a DSL.

**Do NOT suggest a DSL when:**

- ❌ **< 3 repeated sequences** — the Rule of Three did not hit. Wait for the third (YAGNI).
- ❌ **A simple helper/builder already collapses the boilerplate** — KISS > DSL. A named function (`stripe_createCheckoutSession`) or a 1-level builder beats the mini-language. A DSL is only when the helper does not capture the grammar.
- ❌ **The "boilerplate" is real per-site logic** — genuine variation between sites is not boilerplate; abstracting hides a difference that matters.
- ❌ **"It will scale / everything can be parameterized"** — YAGNI. Do not build a speculative DSL for the general case before the 3 real cases.

## Why these rules

- **Both signals together, not one.** Repetition without dominant boilerplate → a helper solves it. High boilerplate without repetition (1 site) → it is just a big function, split or inline it. A DSL is expensive (a new layer, indirection, a learning curve, debugging through the abstraction) — it is only worth it at the crossing of the two.
- **Grammar is the DSL-vs-helper discriminator.** Extracting a function removes duplication; a DSL gives a *language* to express the intent. If there is nothing to "compose", a function is enough — and cheaper.
- **Suggests, does not build (rule 11 / autonomy #6 bright line d).** Creating a DSL is introducing a first-class layer/abstraction — a load-bearing architectural decision. The agent brings the proposal (with an API sketch + a candidate ADR), the architecture owner decides. Building a DSL autonomously would cross the bright line.

## Form — pick the lightest that removes the boilerplate (KISS inside the DSL)

In increasing order of cost — **stop at the first that captures the grammar:**

1. **A fluent builder / factory function** — simple chaining (`q().where().limit()`). The cheapest; covers most cases.
2. **Combinators / a pipeline** — small functions that compose (`pipe(parse, validate, persist)`). When the grammar is composition.
3. **An interpreted declarative object** — data-driven config that a runner walks. When the "language" is a data structure.
4. **A parsed mini-language** (string → AST → exec) — a **last resort**, rarely justified in a product app. It needs a parser, errors, tests of the parser itself — only when the 3 above genuinely do not express the grammar.

## Before proposing — self-critique (a corollary of verification #6)

1. Do the 3 sites repeat the *sequence*, or just use the same primitives in different orders? (different orders → it is not one DSL)
2. Would a 1-level helper collapse 80% of the boilerplate? If yes, propose the helper, not the DSL.
3. Does the proposed DSL hide a real difference between the sites? (if yes, it will leak — rethink the boundary)
4. What is the lightest form (the list above) that captures the grammar? Do not propose a parser if a builder solves it.

## Anti-examples

- ❌ Building an autonomous query-DSL at the 2nd call site — the Rule of Three did not hit; wait for the third (or use a helper).
- ❌ Proposing a parsed mini-language for 3 sequences that a 20-line fluent builder would solve — too expensive a form (use level 1).
- ❌ Calling 3 handlers that validate different things "boilerplate" — it is per-site logic, not repeated wiring; a DSL would hide the difference.
- ❌ Materializing the DSL alone because "it is obviously needed" — it is rule 11: propose + sketch the API + open a candidate ADR; the human approves the new layer.
- ❌ A DSL for the general case ("supports any future provider") with 3 real providers — YAGNI; model the 3, generalize when the 4th diverges.
