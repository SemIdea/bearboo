# Rubrica — classificação de falha (mecânica → procedure | conceitual → learning | transiente → nada)

> Usada pelo loop CRITIC (`ops/remediate.md`) ao remediar uma falha reconhecida e registrada em `docs/.afm-log-failures/`. O discriminador é **executável**, não "sensação". Ancestral: CRITIC (arXiv 2305.11738) — reconhecimento de falha SÓ por sinal externo; auto-crítica sem ferramenta degrada (PRINCIPLES #3).

## Pré-requisito (gate de entrada — comum aos três)

A falha **só existe** se foi reconhecida por **sinal externo**: teste vermelho persistente (cap §5.1 esgotado), `tsc`/type-check ≠0, comando de passo ≠0, regra dura violada pós-fato (gatilho no lado errado), OU **correção explícita do user**. "Eu acho que errei" **não** é falha (CRITIC). Toda falha vira **uma linha-arquivo** em `docs/.afm-log-failures/YYYY-MM-DD-<slug>.md` com `sig=<assinatura>` (chave de recorrência).

## Os três destinos

### Mecânica → `docs/procedures/<slug>.md`

**Sse os três:** (1) é uma **sequência de passos repetível** com gates 0/1 por passo; (2) reincidiu — `grep -lc "sig=<hash>" docs/.afm-log-failures/*.md` ≥ 2 (**OU** correção explícita do user, que vale por 1 — o user é o oráculo); (3) tem **gatilho mecânico de início** ("quando X, rode este runbook").
*Exemplo:* "build quebra com `type:module` no tsdown" reincidiu → runbook "ao mexer no emit, faça A→B→C, verifica 0/1".

### Conceitual → `docs/learnings/<slug>.md`

**Sse:** o valor está na **causa** (uma lição contraintuitiva), não numa sequência mecânica de passos. Mesmo gate de promoção (1 correção do user OU ≥2× mecânica). Carrega `**Gatilho:**` por path → o `afm-pre-edit.sh` injeta em quem editar a área.
*Exemplo:* "assumi que o webhook chega 1×; chega 2× — sempre trate idempotente" → learning com gatilho `webhook`.

### Transiente → nada (fica só evidência no log)

**Sse:** resolvida no retry §5.1 (não cruzou o terminal), OU sem antídoto durável, OU o claim **não sobrevive ao conserto da causa** ("tool X está quebrada" endurece em recusa futura depois que a tool é consertada — negative-filter). Fica como linha em `.afm-log-failures/`, **não** vira artefato. É o #5 (não inventar constraint sem caso durável) e o negative-filter da Fase 4.

## Decision flow

```
Falha reconhecida por sinal externo? ── não → NÃO é falha (CRITIC). Para.
   │ sim
   ▼
Registra em docs/.afm-log-failures/ (sig=).
   │
Resolvida no retry §5.1 / sem antídoto durável / claim morre ao consertar a causa?
   ├── sim → TRANSIENTE: fica evidência, não promove.
   └── não
        │
   1 correção do user OU sig= reincidiu ≥2×?
        ├── não → ainda só evidência (aguarda recorrência).
        └── sim
             │
        Sequência de passos repetível com gates 0/1 + gatilho de início?
             ├── sim → PROCEDURE (docs/procedures/)
             └── não → LEARNING  (docs/learnings/)
```

## Anti-padrões

- ❌ **Reconhecer falha por auto-julgamento** (sem sinal externo). CRITIC: degrada.
- ❌ **Promover falha única mecânica** a artefato (vira ruído/constraint morta). Só ≥2× — exceto correção do user (1 basta).
- ❌ **Promover falha transiente** resolvida no §5.1. Ela nunca chega ao terminal; não é registrada como falha.
- ❌ **Jogar tudo em `procedures/`** (procedure é *sequência mecânica*; lição conceitual é `learning`) ou **tudo em `learnings/`** (runbook repetível é `procedure`).
- ❌ **Procedure/learning sem citar a `sig=` de origem** (rastreabilidade — regra dura 19 / R3).
