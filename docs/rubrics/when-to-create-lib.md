# Rubrica — quando criar `src/lib/<x>/`

## Decisão binária

**Cria lib quando QUALQUER um for verdade:**

- ✅ Já tem **3 callers** do mesmo helper inline (Rule of Three confirmada).
- ✅ É **integração externa nomeável** (Stripe, S3, Resend, Slack, GitHub) — vira `lib/<provider>/`.
- ✅ **> ~150 linhas** de lógica pura acoplada a um consumidor único — extrai pra reduzir carga de leitura.

**NÃO cria lib quando:**

- ❌ Tem 1 caller — inline. Espera o segundo aparecer.
- ❌ Mistura I/O com ORM — vai pra `infra/` ou inline na procedure.
- ❌ Helper com < 10 linhas e 2 callers — duplicação simples vence (KISS > DRY).
- ❌ "Vou precisar mais tarde" — YAGNI. Inline até precisar.

## Por que essas regras

- **3 callers = padrão real, não coincidência.** Dois pode ser convergência espúria.
- **Integração externa merece nome próprio** (`stripe_createCustomer` em vez de `createCustomer`) porque o leitor sabe instantaneamente que é chamada de rede. Reduz custo cognitivo no scan.
- **150 linhas é o ponto onde "vou ler o arquivo inteiro" custa mais que "vou seguir a chamada pro helper".** Antes disso, inline é mais barato pro leitor.

## Onde colocar quando criar

Decisão em ordem:

1. **Lib pura, sem dependência de framework do app?** → `src/lib/<x>/` (publishable; zero ORM/web framework/orchestrator).
2. **Tem regra de negócio do módulo X?** → `src/server/modules/<X>/domain/`.
3. **Vale pra 3+ módulos?** → `src/domain/shared/`.
4. **É wrapper de cliente externo (singleton com config)?** → `src/server/infra/`.

## Antiexemplos

- ❌ `src/lib/utils/format-date.ts` com 1 caller — inline na page que precisa.
- ❌ `src/lib/auth/get-user.ts` que importa o ORM — vai pra `src/server/modules/auth/`, não é lib pura.
- ❌ `src/lib/email-and-notifications/` — mistura responsabilidade. Divide em `src/lib/email/` e `src/lib/slack/`.
- ❌ `src/lib/stripe/` com `class StripeManager { 12 métodos }` — vira `src/lib/stripe/checkout.ts`, `src/lib/stripe/portal.ts`, etc, com funções nomeadas (`stripe_createCheckoutSession`).
