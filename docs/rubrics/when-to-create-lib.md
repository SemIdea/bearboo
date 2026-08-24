# Rubric — when to create `src/lib/<x>/`

## Binary decision

**Create a lib when ANY is true:**

- ✅ There are already **3 callers** of the same inline helper (Rule of Three confirmed).
- ✅ It is a **nameable external integration** (Stripe, S3, Resend, Slack, GitHub) — becomes `lib/<provider>/`.
- ✅ **> ~150 lines** of pure logic coupled to a single consumer — extract it to reduce reading load.

**Do NOT create a lib when:**

- ❌ There is 1 caller — inline. Wait for the second to appear.
- ❌ It mixes I/O with the ORM — goes to `infra/` or inline in the procedure.
- ❌ A helper with < 10 lines and 2 callers — simple duplication wins (KISS > DRY).
- ❌ "I will need it later" — YAGNI. Inline until you need it.

## Why these rules

- **3 callers = a real pattern, not coincidence.** Two can be spurious convergence.
- **An external integration deserves its own name** (`stripe_createCustomer` instead of `createCustomer`) because the reader instantly knows it is a network call. It reduces cognitive cost in the scan.
- **150 lines is the point where "I will read the whole file" costs more than "I will follow the call to the helper".** Before that, inline is cheaper for the reader.

## Where to put it when you create it

Decide in order:

1. **A pure lib, with no app-framework dependency?** → `src/lib/<x>/` (publishable; zero ORM/web framework/orchestrator).
2. **Does it have module X's business rule?** → `src/server/modules/<X>/domain/`.
3. **Is it worth it for 3+ modules?** → `src/domain/shared/`.
4. **Is it an external-client wrapper (a singleton with config)?** → `src/server/infra/`.

## Anti-examples

- ❌ `src/lib/utils/format-date.ts` with 1 caller — inline in the page that needs it.
- ❌ `src/lib/auth/get-user.ts` that imports the ORM — goes to `src/server/modules/auth/`, it is not a pure lib.
- ❌ `src/lib/email-and-notifications/` — mixes responsibility. Split into `src/lib/email/` and `src/lib/slack/`.
- ❌ `src/lib/stripe/` with `class StripeManager { 12 methods }` — becomes `src/lib/stripe/checkout.ts`, `src/lib/stripe/portal.ts`, etc, with named functions (`stripe_createCheckoutSession`).
