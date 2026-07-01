# Rubrica — fronteira episódico vs semântico (o que decai vs o que é permanente)

> Materializa o princípio invariante #1 ("se outro agente sem minha memória precisa saber, é doc") na dimensão **temporal**: nem todo artefato de `/docs/` é conhecimento permanente. v3.1.0+ (Fase 3 da iniciativa v3.2). Ancestral: CoALA (arXiv 2309.02427) — memória **episódica** (o que aconteceu) ≠ **semântica** (o que se sabe) ≠ **procedural** (como se faz).

## Os tiers no AFM

| Tier | O que é | Onde vive | Decai? | Entra nos eixos A1–A7 do diagnose? |
|---|---|---|---|---|
| **Semântico** | conhecimento durável: regras, arquitetura, decisões, surpresas | `afm.md`, `ach.md`, `prd.md`, `ust.md`, `gotchas.md`, `adr/`, `learnings/`, `rubrics/` | **Não** — supersedeável (ADR Substituída, tombstone), nunca apaga | **Sim** |
| **Procedural** | sequências repetíveis | `procedures/` | frequência/staleness (`restructure`) | Sim (cobertura herdada) |
| **Episódico** | o que aconteceu numa sessão: estado de trabalho, handoff | `sessions/` (handoff), `_focus.md` (foco atual) | **Sim** — handoff `open` envelhecido decai (A2); `_focus` é OVERWRITE | **NÃO** (é estado, não conhecimento) |
| **Telemetria** | log append-only de eventos/falhas | `.afm-log/`, `.afm-log-failures/` | só por rotação/retenção; auditoria = git | **NÃO** (append-only) |

## Critério (decisão)

- **É conhecimento que outro agente sem minha memória precisa pra não quebrar?** → **semântico** (permanente, entra no diagnose, nunca decai sozinho). É o #1.
- **É "onde eu estava" / "o que aconteceu nesta sessão"?** → **episódico** (decai, fica fora do diagnose). Dar permanência a isso infla o diagnose com ruído.
- **Promoção episódico → semântico** é o ponto do `reconcile`: quando um episódio revela uma decisão/regra/gotcha load-bearing, propõe materializar no tier semântico (gate humano, #6). O episódio é o **buffer** de onde a evolução pesca candidatos; não é a evolução.

## Anti-padrões

- ❌ **Tratar handoff/`_focus` como doc normativo** — infla o diagnose (A1–A7) com estado volátil. São episódicos.
- ❌ **Decair conhecimento semântico** — regra/decisão/gotcha não decai por idade; supersede (ADR) ou consolida (`generalize`), nunca apaga por tempo (#5: memória institucional).
- ❌ **`_focus.md` que cresce** — é estado pequeno e sobrescrito (regra 20), não um log.
- ❌ **Promover episódio a semântico sem cruzar o #1** — nem todo "o que aconteceu" é "o que outro precisa saber".
