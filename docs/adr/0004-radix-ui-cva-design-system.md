# ADR-0004 — Radix UI + CVA (design system estilo shadcn)

> **Status:** Aceita (retroativo, originado em `/afm:refactor`)
> **Data:** 2026-06-30
> **Decidido por:** dono do produto (adoção retroativa)

## Contexto

`src/components/ui/` contém primitivos baseados em `@radix-ui/react-*` (dropdown-menu, label, separator, slot, tabs) estilizados com `class-variance-authority` + Tailwind v4, seguindo o padrão de distribuição do shadcn (`components.json` presente, com `style: "new-york"`, `baseColor: "zinc"`). Não há `@vireya/*` no projeto.

## Decisão

Componentes de UI base são copiados (não instalados como dependência de runtime) via `npx shadcn add` e mantidos in-place como código próprio do projeto, compostos com `cva` para variantes tipadas e `cn()` (`clsx` + `tailwind-merge`, em `src/lib/utils.ts`) para composição de classes.

## Alternativas consideradas

- **Biblioteca de componentes pré-empacotada (ex: MUI, Chakra)** — não avaliada no código; a escolha por primitivos copiáveis é consistente com o objetivo de portfólio/estudo (controle total do código, sem black-box de terceiros).

## Consequência

- **Fica fácil:** customização total dos primitivos (são código do projeto, não uma dependência opaca).
- **Fica difícil:** atualizações de upstream do shadcn não chegam automaticamente — exige reaplicar manualmente via CLI e resolver conflitos com customizações locais.
- **Load-bearing:** trocar de design system hoje refaz todo `src/components/ui/` e qualquer lugar que componha via `cva`/`cn()`.

## Referências

- Doc canônico: `/docs/ach.md` § 3.2 (UI primitives), § 6 (Nomeação).
