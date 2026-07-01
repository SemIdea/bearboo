# Gotchas — surpresas que travam outro dev

> Cada item é uma surpresa contraintuitiva descoberta na prática. Nasce vazio, cresce sob demanda.
>
> **Regra de entrada:** só vira gotcha o que travou alguém pelo menos 2× ou tem alta probabilidade de travar (gotcha de SDK/runtime/lib externa). Não inventa gotcha — descobre.
>
> **Formato:** cada gotcha tem **gatilho** ("se você está editando X, leia antes") + **comportamento contraintuitivo** + **solução** + link pro ADR ou doc canônico se houver.
>
> **Ordem:** por área (não cronológica). Use Ctrl-F com nome de arquivo ou symbol.

---

## Next.js — `cookies()` / `headers()` só em Server Component / route handler

**Gatilho:** se você está usando `cookies()` ou `headers()` de `next/headers` numa lib pura ou em Client Component.

**Comportamento:** ambos só funcionam no contexto de request — Server Component, route handler, server action. Em qualquer outro lugar joga error em runtime.

**Solução:** ler cookies no Server Component / route handler, passar pro componente client como prop. Nunca importar `next/headers` em código que pode rodar no browser.

**Ref:** confirmado pelo time na adoção retroativa (`/afm:refactor`, 2026-06-30) como já mordido.

---

## Next.js — `revalidatePath` / `revalidateTag` não invalida React Query

**Gatilho:** se você está em route handler ou server action e quer refresh do cache do client.

**Comportamento:** `revalidatePath` invalida o cache do Next (RSC + fetch), mas o React Query no cliente tem cache próprio. Mutation via server action precisa também invalidar a query no cliente — não chega automático.

**Solução:** retorna sinal pro client que dispara `queryClient.invalidateQueries(...)`. Ou usa cliente do stack que já integra (ex: `@trpc/tanstack-react-query` invalida automático em `onSuccess`).

**Ref:** confirmado pelo time na adoção retroativa (`/afm:refactor`, 2026-06-30) como já mordido. Ver `src/server/features/post/revalidate/` (feature dedicada a revalidar ISR).

---

<!--
SEED candidato adicional de módulo detectado no scan (Next.js App Router), ainda não confirmado como mordido — ativar só se acontecer.

## Next.js — root layout sob segmento dinâmico deixa `_not-found` órfão

**Gatilho:** se você deletar `app/layout.tsx` e mover `<html>`/`<body>` pra um segmento dinâmico (ex: `app/[lang]/layout.tsx`).

**Comportamento:** o Next gera uma rota interna `/_not-found` que vive fora do segmento dinâmico, sem root layout pra compor o documento.

**Solução:** `app/global-not-found.tsx` + `experimental.globalNotFound: true`. Não se aplica hoje ao Bearboo (sem rotas `[lang]`), mas fica registrado caso i18n entre em escopo.
-->

---

*Adicionar gotcha novo: copia o formato acima. Coloca em ordem alfabética por área. Se não tem área pra colocar, cria seção H2 nova.*
