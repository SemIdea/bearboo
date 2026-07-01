# Rubrica — quando criar módulo top-level em `server/modules/`

## Decisão binária

**Cria módulo novo quando TODOS forem verdade:**

- ✅ Tem **entidade própria** (model novo, não campo num model existente).
- ✅ Já tem **≥ 2 procedures** previstas (não 1 isolada).
- ✅ Tem **estado próprio com lifecycle** (não é só lookup table estática).

**Senão é sub-feature de módulo existente.** Ex: `notifications` que só serve `auth` mora como `src/server/modules/auth/notifications/`, não como módulo top-level.

## Por que essas regras

- **Entidade própria** define a fronteira natural do módulo. Sem entidade, é só feature de outro módulo (campo, comportamento extra).
- **≥ 2 procedures** garante que o módulo tem superfície de uso suficiente. Procedure isolada não justifica diretório próprio + router próprio + domain próprio.
- **Lifecycle** distingue "domínio com estado" de "configuração estática". Plano (FREE/PRO) é enum + lookup table → não é módulo `plans/`, é parte de `billings/`.

## Antes de criar — pergunta de revisão

1. Esse conceito existe em algum módulo atual? Se sim, é sub-feature.
2. Vai compartilhar `domain/`, `infra/`, ou tipos com outro módulo? Se sim, considera `src/domain/shared/` em vez de módulo novo.
3. Vai durar > 6 meses sem ser tocado? Se sim e não cresce, talvez seja só helper, não módulo.

## Antiexemplos

- ❌ Criar `modules/notifications/` quando só auth dispara notification — fica em `modules/auth/notifications/`.
- ❌ Criar `modules/plans/` pra hospedar `PLAN_CONFIG` constante — fica em `modules/billings/plan-config.ts`.
- ❌ Criar `modules/utils/` pra agregar helpers cross-module — não existe módulo `utils`, helpers vão pra `lib/` ou inline.
- ❌ Criar `modules/admin/` cedo "porque vai ter painel admin depois" — YAGNI. Espera primeira procedure admin aparecer.
