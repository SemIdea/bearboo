# Feature 008 — Plan

> **Spec:** [`./spec.md`](./spec.md)
> **Status do plan:** approved
> **Stack inferido:** tRPC v11 (RC) client + React Query (`docs/ach.md`, ADR-0001), `src/context/trpc/*` já é o componente-tipo estabelecido pro client tRPC.
> **Data:** 2026-07-12

## 1. Approach em 3 frases

Troca a interceptação de erro de sessão do nível de `fetch` (parsing manual de JSON cru dentro de `customFetcher`) pro nível de link tRPC (um `TRPCLink` que recebe `TRPCClientError` já tipado via `next(op)`/`observable`). O novo link (`sessionRefreshLink`) entra na cadeia de `links` do `client.ts`, entre o `loggerLink` e o `httpBatchLink` terminal — mesmo padrão arquitetural já usado pelos links existentes (`loggerLink`, `httpBatchLink`), não introduz camada nova. `fetcher.ts` é deletado por inteiro (toda sua lógica migra pro novo link).

## 2. Componentes afetados

| Componente-tipo | Arquivo / módulo | Novo ou edita | Por quê |
| --- | --- | --- | --- |
| tRPC client link | `src/context/trpc/sessionRefreshLink.ts` | novo | contém a lógica de retry-on-401/redirect que hoje vive em `fetcher.ts`, mas operando sobre `TRPCClientError` tipado em vez de `Response` cru |
| tRPC client wiring | `src/context/trpc/client.ts` | edita | adiciona `sessionRefreshLink` na cadeia de `links`; remove `fetch: customFetcher` do `httpBatchLink` |
| tRPC client (obsoleto) | `src/context/trpc/fetcher.ts` | **deleta** | totalmente superado pelo link novo; nenhum outro módulo importa `customFetcher`/`extractSessionErrorCode` (confirmado via grep) |
| Teste | `src/context/trpc/__test__/fetcher.ts` | **deleta** | testava só `extractSessionErrorCode`, que deixa de existir |
| Teste | `src/context/trpc/__test__/sessionRefreshLink.ts` | novo | cobre os 4 comportamentos do § 2 do spec, mockando `next()` (fake observable) + `refreshTokens`/`clearAuthData` |

## 3. Modelo de dados (delta)

Sem delta — nenhuma entidade Prisma/schema tocada. Feature é puramente client-side (transporte).

## 4. Decisões arquiteturais

- **Decisão:** implementar como `TRPCLink<AppRouter>` posicionado entre `loggerLink` e `httpBatchLink` no array `links` de `client.ts`. **Alternativa rejeitada:** manter a interceptação em `fetch` mas trocar só o parsing interno (ex: usar `Response.json()` só quando `content-type` bate). **Por quê:** a alternativa ainda dependeria da forma como `httpBatchLink` serializa a resposta (array batch, campo `error.json.message`) — exatamente o acoplamento frágil que causou o bug de 2026-07-11. O link recebe `TRPCClientError` já parseado pelo próprio `@trpc/client` (`TRPCClientError.from`, que lê `cause.error.message`/`cause.error.data`), então uma mudança de formato de serialização é responsabilidade do tRPC manter estável — não mais nossa.
- **Decisão:** retry-after-refresh implementado via re-subscribe manual dentro do `observable()` (não usar o `retryLink` embutido do `@trpc/client`). **Alternativa rejeitada:** `retryLink` nativo do pacote. **Por quê:** `retryLink` (confirmado em `node_modules/@trpc/client/dist/index.d.mts`) é genérico pra retry de rede/timeout, não tem hook pra "rodar `refreshTokens()` async antes do retry" — precisaríamos compor os dois de qualquer forma, e a lógica de decisão (qual `code`/`message` dispara qual ação) é specific-domain, não genérica.
- **Decisão:** manter as mesmas 4 branches de comportamento do `customFetcher` original (SESSION_EXPIRED→refresh+retry 1x, INVALID_TOKEN→limpa+redireciona login, INVALID_CREDENTIALS→deixa passar, FORBIDDEN/USER_NOT_VERIFIED→redireciona verify), sem adicionar nem remover nenhuma. **Por quê:** escopo desta feature é robustez de parsing, não mudança de comportamento (spec § 4 out of scope).
- **Decisão:** feature standalone (008), não dobrada em `001-auth-hardening`. **Alternativa rejeitada:** tratar como task dentro do spec de hardening. **Por quê:** `001-auth-hardening` é `draft`, escopo amplo de segurança (expiração real de sessão, cookie `HttpOnly`, CSRF, rate limiting) ainda não iniciado; esta fix é sobre robustez de parsing de um bug já registrado e isolado em `ust.md`. Bundle infla o escopo de review de ambas.

## 5. Contratos (boundaries externos)

Sem boundary externo novo — o boundary tRPC client↔server já existe (ADR-0001). O que muda é onde, no client, o erro desse boundary é interpretado.

### Boundary `sessionRefreshLink` (interno, não é boundary de rede novo)

```ts
// input — o que o link recebe do próximo link na cadeia, ao dar erro
TRPCClientError<AppRouter> {
  message: string          // ex: "SESSION_EXPIRED" (SessionErrorCode)
  data: {
    code: "UNAUTHORIZED" | "FORBIDDEN" | ...  // TRPC_ERROR_CODE_KEY
    httpStatus: number
    path?: string
  } | undefined
}

// side effects por combinação (code, message)
"UNAUTHORIZED" + SessionErrorCode.SESSION_EXPIRED  → refreshTokens() + retry 1x (ou clearAuthData+redirect /auth/login se refresh falhar)
"UNAUTHORIZED" + SessionErrorCode.INVALID_TOKEN     → clearAuthData() + redirect /auth/login
"UNAUTHORIZED" + AuthErrorCode.INVALID_CREDENTIALS  → nenhum side effect, erro repassado
"FORBIDDEN" + AuthErrorCode.USER_NOT_VERIFIED       → redirect /auth/verify, erro repassado
qualquer outro                                       → erro repassado sem side effect
```

## 6. Complexity tracking

| Complexidade aceita | Alternativa simples rejeitada | Por quê não foi simples |
| --- | --- | --- |
| Re-subscribe manual dentro de `observable()` pra implementar retry-after-async-refresh | Deixar o retry só no nível do `customFetcher` (como hoje) | O objetivo da feature é justamente sair do nível de `fetch`; `observable`/`next`/link é a primitiva nativa do tRPC pra isso — é o "jeito certo" documentado pelo próprio pacote (outros links internos do `@trpc/client`, como `httpBatchLink`, já usam essa mesma primitiva) |

## 7. Validação contra invariantes

- [x] Regra dura 1 (nenhum código novo sem teste) — `sessionRefreshLink.ts` ganha teste próprio cobrindo as 4 branches + o caso "sem erro" (passthrough).
- [x] Regra dura 2 (zero `any`/`unknown` em helpers próprios) — `TRPCClientError.data.code` é tipado (`TRPC_ERROR_CODE_KEY`), sem cast.
- [x] Regra dura 4 (`tsc --noEmit` limpo antes de commit).
- [x] Regra dura 6 (arquivo ≤300 linhas) — `sessionRefreshLink.ts` estimado ~60-70 linhas.
- [x] Regra dura 10 (sem shim de compat) — `fetcher.ts` é deletado por inteiro, não comentado/depreciado.
- [x] Regra dura 11 (mudança arquitetural pára e pergunta) — **satisfeita**: gate único do `/afm:deliver` apresentado e aprovado pelo user nesta sessão ("Executa até o fim"). Não é camada nova: `TRPCLink` já é um componente-tipo em uso (`loggerLink`, `httpBatchLink` já vivem em `client.ts`).
- [x] `[NEEDS CLARIFICATION:]` zerado (spec § 5/7 vazios).

## 8. Riscos

- **Risco:** comportamento do link em relação a *quantas* vezes o `next(op)` é re-executado por operação batched (múltiplas procedures na mesma chamada HTTP) pode diferir sutilmente do `customFetcher` (que operava no nível do `fetch` inteiro, afetando o batch todo de uma vez). **Mitigação:** os testes cobrem o link isoladamente (unidade), e verificação manual ao vivo (dev server + login/refresh real) confirma o comportamento fim-a-fim antes do commit.
- **Risco:** `window` não existe no ambiente de teste (vitest roda em `node`, sem jsdom configurado — confirmado em `vitest.config.ts`). **Mitigação:** testes usam `vi.stubGlobal("window", ...)` pra simular `window.location.href` sem precisar de jsdom.

## 9. Open questions

_(nenhuma — ver spec § 5)_

---

*Plan NÃO contém: lista granular de tasks (vai pro `tasks.md`). Plan NÃO escolhe stack — lê de `ach.md`.*
