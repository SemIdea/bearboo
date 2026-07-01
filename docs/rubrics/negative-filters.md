# Rubrica — negative-filters (o que NÃO promover a doc durável)

> Checklist de **rejeição** no gate de entrada de `gotcha`/`reconcile`/`remediate`. A face negativa do princípio #5 ("não inventar"): **constraint falsa é veneno** — pior que ausência, porque endurece em recusa/erro futuro. v3.1.0+ (Fase 4 da iniciativa v3.2). Evidência de campo (ai-memory): num acervo real, ~28% das páginas eram sessões de baixo sinal que só poluíam o retrieval.

## Rejeitar (NÃO vira gotcha/learning/regra/procedure)

| Anti-padrão | Por que é veneno | O que fazer |
|---|---|---|
| **Claim negativo sobre tool** ("tool X está quebrada", "lib Y não funciona") | Endurece em **recusa fóssil**: depois que a tool é consertada, o doc faz o próximo agente evitá-la sem motivo. | Registra o *workaround* concreto (se durável), não o veredito "está quebrada". Some quando a causa é consertada → transiente. |
| **Falha transiente** (resolvida no retry §5.1, credencial/binário ausente no momento, estado de setup) | Vira **constraint morta**: a condição já não existe; o doc mente pro futuro. | Fica evidência em `.afm-log-failures/`, não artefato. Captura o *padrão de retry/fix*, não a falha temporária. |
| **Narrativa one-off** ("nesta sessão fiz A, B, C") | Cronologia já vive em `docs/.afm-log/`/`sessions/`; como doc normativo é ruído. | Handoff episódico (`sessions/`), não doc semântico. |
| **Status user-visível** ("o build está passando agora", "deploy ok") | Estado momentâneo, não conhecimento. | `_focus.md` (estado) ou handoff, não `gotcha`/`adr`. |
| **Marker de release / smoke test** ("v0.1.1 publicada", "echo ok") | Operacional, não lição reusável. | `notes`/log, nunca regra/gotcha. |
| **Regra-vibe sem gatilho** (KISS, DRY como "regra") | Sem gatilho executável 0/1 não é regra dura (#3). | Princípio em `afm.md § 1.3`, não § 3. |

## Teste de promoção (passa o gate SE)

1. **Tem antídoto durável?** (uma ação concreta que previne, não um veredito.)
2. **O claim sobrevive ao conserto da causa?** (se "some quando consertam X", é transiente → rejeita.)
3. **Outro agente sem minha memória precisa saber pra não quebrar?** (#1 — senão é memória/estado, não doc.)
4. **Reincidiu ≥2× OU é correção do user OU doc de SDK externo?** (#5 — senão é evidência, ainda não artefato.)

Os quatro **sim** → promove. Qualquer **não** estrutural → fica evidência/estado, não doc durável.

## Anti-padrões (do próprio gate)

- ❌ **Promover por precaução** ("melhor registrar pra garantir"). Constraint falsa é pior que vazio (#5).
- ❌ **Confundir transiente com durável** — o oráculo é "sobrevive ao conserto da causa?".
- ❌ **Tratar todo erro como gotcha** — erro reconhecido vai pro loop CRITIC (`remediate`), que aplica este filtro.
