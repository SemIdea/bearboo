---
type: rubric
description: Decides when a DSL is worth suggesting, and when it is premature.
load: warm
fires_on: repo-shape
detector: dsl
fires_when: 'three or more call sites repeat one fixed-order sequence'
---

# Rubric — when to create a DSL (suggest, do not build)

> DSL here means any domain mini-language that collapses repeated boilerplate of primitive calls: a fluent builder, a combinator pipeline, a declarative object that gets interpreted, or a parsed language. **DSL-first is the complement of the Rule of Three, not the opposite of KISS.** The agent does not abstract early. But when primitive boilerplate scales AND has grammar, a DSL pays for itself. The agent **suggests** (proposes and sketches). The agent **does not build alone** (hard rule 11 — a DSL is a first-class layer or abstraction, so it stops and asks).

## Binary decision

**Suggest a DSL only when BOTH signals are true:**

- ✅ **Repetition (Rule of Three of sequence):** 3 or more call sites repeat the same sequence of N or more primitive calls, in fixed order. This is not 3 loose calls. The *sequence* itself repeats. Only the parameters vary, not the structure.
- ✅ **Boilerplate dominates the intent (ratio):** at these sites, most lines are mechanical wiring, setup, or glue, not real business logic. The reader cannot see *what* the code wants through *how* it wires the primitives together.

**A third condition tells a DSL apart from "extract a function":**

- ✅ **Reusable grammar exists** — composition, required ordering, branching, or chaining that repeats. This is what makes a DSL pay more than a helper. Without grammar (just "call 5 functions in the same fixed sequence"), **a named helper wins.** That case is not a DSL.

**Do NOT suggest a DSL when:**

- ❌ **Fewer than 3 repeated sequences.** The Rule of Three has not been met. Wait for the third case (YAGNI).
- ❌ **A simple helper or builder already collapses the boilerplate.** KISS beats DSL here. A named function (`stripe_createCheckoutSession`) or a one-level builder wins over a mini-language. Use a DSL only when the helper cannot capture the grammar.
- ❌ **The "boilerplate" is real per-site logic.** Genuine variation between sites is not boilerplate. Abstracting it would hide a difference that matters.
- ❌ **"This will scale" or "we can parametrize everything."** This is YAGNI. Do not build a speculative DSL for the general case before 3 real cases exist.

## Why these rules

- **Both signals together, not one.** Repetition without dominant boilerplate: a helper solves it. High boilerplate without repetition (1 site): it is just a large function — split it or inline it. A DSL is expensive (new layer, indirection, a learning curve, debugging through the abstraction). It pays off only at the intersection of both signals.
- **Grammar is the DSL-versus-helper discriminator.** Extracting a function removes duplication. A DSL gives you a *language* to express the intent. If there is nothing to "compose," a function is enough, and cheaper.
- **Suggest, do not build (rule 11 / autonomy principle 6, bright line d).** Creating a DSL introduces a first-class layer or abstraction. This is a load-bearing architectural decision. The agent brings the proposal, with an API sketch and a candidate ADR. The architecture owner decides. Building a DSL on its own would cross the bright line.

## Form — pick the lightest one that removes the boilerplate (KISS inside the DSL)

In increasing order of cost — **stop at the first form that captures the grammar:**

1. **Fluent builder / factory function** — simple chaining (`q().where().limit()`). This is the cheapest form. It covers most cases.

   **Purity:** chain methods only assemble immutable data. IO stays in one terminal call (`.exec()` or `.run()`). A side effect in the middle of the chain forces you to mock the world to test a pure rule. This is the "mock that simulates more than needed" smell (see § 5). **Hard rule 7** separates pure domain from glue for this exact reason. A builder placed outside `src/<domain>/` escapes that separation.

   Counter-example: `checkout().comValor(v).cobrarNoStripe().comDesconto(d)`. Here `cobrarNoStripe()` sits mid-chain and mixes IO with data assembly.
2. **Combinators / pipeline** — small functions that compose (`pipe(parse, validate, persist)`). Use when the grammar is composition.
3. **Declarative interpreted object** — data-driven config that a runner walks through. Use when the "language" is a data structure.
4. **Parsed mini-language** (string to AST to exec) — **last resort**, rarely justified in a product app. It needs a parser, error handling, and tests for the parser itself. Use it only when the 3 forms above genuinely cannot express the grammar.

## Before proposing — self-check (verification corollary 6)

1. Do the 3 sites repeat the same *sequence*, or do they just use the same primitives in different orders? (Different orders mean it is not one DSL.)
2. Would a one-level helper collapse 80% of the boilerplate? If yes, propose the helper, not the DSL.
3. Does the proposed DSL hide a real difference between the sites? If yes, it will leak — rethink the boundary.
4. Which form above is the lightest one that captures the grammar? Do not propose a parser if a builder solves it.
5. Is there a required order between chain steps? If yes, the proposed form must reject the wrong order at **compile time**, not a runtime `throw`. Use type-state: each method returns a type that exposes only the next legal methods. **If type-state gets expensive, do not propose the builder.** A single function with all required arguments solves the same problem without the technique.

## Counter-examples

- ❌ Building a standalone query DSL at the 2nd call site — the Rule of Three has not been met. Wait for the third case, or use a helper.
- ❌ Proposing a parsed mini-language for 3 sequences that a 20-line fluent builder would solve — too expensive a form (use level 1 instead).
- ❌ Calling 3 handlers that check different things "boilerplate" — this is per-site logic, not repeated wiring. A DSL would hide the difference.
- ❌ Building the DSL alone because "it is obviously needed" — this is rule 11. Propose it, sketch the API, and open a candidate ADR. The human approves the new layer.
- ❌ A DSL for the general case ("supports any future provider") built from 3 real providers — this is YAGNI. Model the 3 real cases and generalize when a 4th case actually diverges.
