# Feature 009 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status:** approved (gate 2026-07-12, "Sim, tira o Suspense")

## 1. Resumo técnico

`src/app/(half)/post/[slug]/page.tsx` hoje exporta `Page` como um componente síncrono que envolve `PostContent` (async, `"use cache"`) num `<Suspense fallback={<p>Loading post...</p>}>`. Next.js começa a enviar o shell da resposta (200) antes do boundary resolver, então quando `PostContent` chama `notFound()`, o status HTTP já foi decidido. A correção funde a lógica de `PostContent` direto em `Page`, tornando `Page` async e removendo o `<Suspense>` — a resposta só começa a ser enviada depois que os dados (ou o `notFound()`) resolvem.

## 2. Componentes afetados

| Componente | Mudança |
| --- | --- |
| `src/app/(half)/post/[slug]/page.tsx` | `Page` vira async, absorve o corpo de `PostContent`; `PostContent` e o `import { Suspense }` somem. `generateMetadata` não muda. |

## 3. Fora de escopo

Ver `spec.md` § 4.

## 4. Decisões arquiteturais

- **Fundir `PostContent` em `Page` vs. manter dois componentes:** fundir. Não há mais motivo pra um componente interno separado depois que o `Suspense` some — dois componentes só faria sentido se algo mais (ex. outro `Suspense` boundary) ainda precisasse envolver só uma parte.
- **Alternativa rejeitada — `loading.tsx` de rota:** o Next.js permite um `loading.tsx` irmão do `page.tsx` que cria implicitamente um `Suspense` em volta de toda a página, reproduzindo o mesmo bug (200 antes do `notFound()`). Rejeitada pelo mesmo motivo que remover o `Suspense` explícito.

## 5. Contratos

Nenhum contrato novo — `generateMetadata`/`Page` continuam a única superfície pública do arquivo (rota Next.js).

## 6. Riscos

- Perda do fallback "Loading post..." — aceito explicitamente no gate (ver `spec.md` § 5). Página passa a bloquear a resposta HTTP até os dados chegarem (mitigado por `"use cache"`/`cacheLife("hours")`, que já existia e continua).
- Verificação de status HTTP real requer request via `next start`/`curl` contra dev server — sandbox anterior teve `DATABASE_URL` mal configurado (ver `008-trpc-error-link/tasks.md` T007); se persistir aqui, documentar como limitação e confiar em leitura de código + `next build` limpo.

## 7. Validação contra invariantes (regras duras)

- Regra 1 (teste): não há teste automatizado de status HTTP hoje neste repo (nenhuma rota tem); verificação fica documentada como manual/best-effort em `tasks.md`, igual T007 da 008. Não é regressão de cobertura — não remove teste existente.
- Regra 4 (`tsc --noEmit` limpo): checar após a mudança.
- Regra 6 (arquivo ≤300 linhas): `page.tsx` cresce ~15 linhas (perde o wrapper `Page`, ganha os campos que já existiam em `PostContent`) — net neutro, seguirá abaixo do limite.
- Regra 11 (mudança arquitetural pára e pergunta): já passou pelo gate desta sessão — não é decisão nova.

## 8. Dependências

Nenhuma.

## 9. Achado durante implementação (2026-07-12) — plano original invalidado

A fusão de `PostContent` em `Page` (removendo `<Suspense>`) foi implementada e testada. Resultado: `npx tsc --noEmit` limpo e `npx vitest run` (147/147) verdes, mas **`next build` quebrou** com `Error: Route "/post/[slug]": Uncached data was accessed outside of <Suspense>` (confirmado com `next build --debug-prerender`, que aponta o próprio `Page` como origem — não um efeito colateral de outro componente). Comparação via `git stash` + rebuild confirmou que esse erro **não existe em `main`** — é causado por esta mudança, não pré-existente.

Investigação (`WebFetch` na doc oficial `https://nextjs.org/docs/messages/blocking-route` e `https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents`) confirmou: com `cacheComponents: true` (`next.config.ts`), **toda** leitura assíncrona não-`"use cache"` precisa de um `<Suspense>` pai — sem exceção, sem `export const dynamic = "force-dynamic"` (removido do Next 16 junto da adoção de Cache Components como conceito unificado de PPR). Não há como ter uma rota totalmente bloqueante sob esse regime.

**Consequência:** o § 4 (decisões arquiteturais) e a mudança proposta no § 2 estão invalidados. A mudança foi revertida (`git checkout -- src/app/(half)/post/[slug]/page.tsx`). Gotcha registrado em `docs/gotchas.md` § Cache Components (alta chance de bater de novo em qualquer rota dinâmica nova). `docs/ust.md` atualizado com o achado.

**Caminhos possíveis pra resolver de verdade** (nenhum implementado — decisão do dono, regra dura 11):

1. **Checagem de slug em `middleware`/`proxy` (Edge)** antes do request chegar no pipeline de Cache Components, retornando 404 direto se o slug não existir. Exigiria Prisma compatível com Edge runtime (o projeto já tem `@prisma/extension-accelerate` como dependência, o que sugere viabilidade, mas não foi validado). Infra nova de 1ª classe — maior escopo, precisa de spec própria.
2. **Aceitar o status 200 como limitação conhecida** e não investir mais nisso — o conteúdo da página já está correto (`notFound()` renderiza a UI de "não encontrado"), só o status HTTP fica incorreto pra bots. Documentar como limitação aceita em vez de pendência aberta.
3. **Desligar `cacheComponents` globalmente** — descartado: blast radius muito grande (afeta toda estratégia de cache do app), desproporcional a um único status HTTP.
