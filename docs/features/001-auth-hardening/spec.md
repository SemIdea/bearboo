# Feature 001 — Hardening da autenticação pra produção

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-002 (Login e criação de sessão), US-003 (Refresh e logout de sessão) — US-001 (Registro) tocada perifericamente.
> **Status:** done (2026-07-12 — `tsc --noEmit` limpo, `vitest` 188/188 verdes incl. testes novos de sessão/rotação/reuse-detection/rate-limit/mensagens genéricas; verificado ao vivo contra Postgres real via Docker + `curl`: 2 `Set-Cookie` distintos em login, refresh rotaciona, reuse de token antigo revoga a sessão inteira, rate limit 10/11 rejeita; achado e corrigido durante a verificação ao vivo um bug de key de rate-limit sem escopo por endpoint — ver `plan.md` § 10. Infra (TLS, docker-compose) explicitamente fora de escopo — ver § 4)
> **Data de abertura:** 2026-06-30

## 1. Problema (do PRD/UST)

A auth própria do Bearboo (decisão em `docs/adr/0005-manter-auth-propria.md`) funciona no fluxo feliz — registro, login, verificação de email, reset de senha, refresh/logout de sessão (US-001/002/003, todas `done`) — mas foi construída sem hardening de produção. Uma análise de código (2026-06-30) encontrou tokens de sessão que nunca expiram no servidor, cookies/localStorage sem proteção contra XSS/CSRF, ausência de rate limiting, enumeração de email em login/reset, e infraestrutura (TLS, credenciais) não endurecida. O dono do produto (Bruno) quer levar essa auth a um padrão real de produção, dado que o objetivo do Bearboo é demonstrar prática de arquitetura sólida (`prd.md` § 2-3).

## 2. Critério de sucesso observável

- [x] Uma sessão comprometida (accessToken/refreshToken vazado) deixa de ser válida sozinha após um tempo determinado — hoje é válida pra sempre. Idle timeout (30min) + vida máxima absoluta (30 dias) + rotação de refresh token com detecção de reuse (token antigo reutilizado revoga a sessão inteira).
- [x] Nenhuma resposta de `loginUser`, `sendResetPasswordEmail` ou `registerUser` permite distinguir, pela mensagem/código de erro, se um email já tem conta. Login e reset genéricos (Clarification 2026-07-12); registro mantém `USER_ALREADY_EXISTS` (decisão explícita, § 7).
- [x] Tentativas repetidas de login/registro/reset/refresh acima de um limite são bloqueadas/atrasadas, verificável por teste que dispara N+1 chamadas e observa rejeição. Rate limit em memória por endpoint (`src/lib/rateLimit/`), verificado ao vivo (10/11 rejeitado).
- [x] O token de sessão não é legível por `document.cookie`/`localStorage` a partir de JS da própria página (verificável inspecionando os cookies emitidos: `HttpOnly` presente). Confirmado ao vivo via `curl -v`: `HttpOnly; SameSite=Lax` em ambos os cookies.
- [x] Uma mutation tRPC autenticada não pode ser disparada por uma página de outra origem usando só o cookie ambiente (CSRF). `SameSite=Lax` bloqueia POST cross-site (mutations tRPC vão por POST via `httpBatchLink`) — ver `plan.md` § 4.2.
- [ ] `docker-compose.yml` de produção não contém credencial hardcoded nem porta de banco exposta ao host sem necessidade. **Adiado nesta rodada** — ver § 4 e Clarification 2026-07-12.
- [ ] Tráfego de produção roda sobre HTTPS (certificado + redirect de 80→443 ou HSTS). **Adiado nesta rodada** — ver § 4 e Clarification 2026-07-12.

## 3. Cenários (Gherkin)

```gherkin
Scenario: Sessão expira após período de inatividade/vida máxima
  Given uma sessão criada há mais tempo que o limite definido
  When qualquer procedure protegida é chamada com essa sessão
  Then a chamada é rejeitada como não autorizada
  And a sessão expirada não pode ser revivida por refresh

Scenario: Refresh token roubado e reutilizado após rotação
  Given um refresh token que já foi rotacionado (substituído por um novo)
  When alguém tenta usar o refresh token antigo
  Then a operação é rejeitada
  And a sessão inteira (família de tokens) é revogada, não só o token antigo

Scenario: Login com email inexistente vs senha errada
  Given um email sem conta E um email com conta mas senha errada
  When cada um tenta logar
  Then ambos recebem a mesma mensagem de erro genérica

Scenario: Requisição cross-site tentando mutation autenticada
  Given um usuário autenticado navegando pra um site de terceiro malicioso
  When o site de terceiro dispara uma mutation tRPC do Bearboo
  Then a mutation é rejeitada (CSRF bloqueado)

Scenario: Brute-force de login
  Given N tentativas de login com senha errada pro mesmo email/IP acima do limite
  When a tentativa N+1 ocorre
  Then é rejeitada por rate limit, antes mesmo de checar a senha
```

## 4. Out of scope

- **2FA/MFA.** Não faz parte deste hardening — item de roadmap futuro se necessário.
- **Migrar bcrypt → Argon2id.** Custo 10 do bcrypt é debatido no gap-analysis mas não é bloqueante — fica como possível ADR/feature separada se o time decidir.
- **Gerenciamento de sessões ativas (listar/revogar de outro device).** UX avançada, não é hardening de segurança básico.
- **CI/CD com security scanning (SAST/dependabot).** Pertence à Fase 10 do `docs/roadmap.md`, não a esta feature.
- **Migrar de Auth.js/Better Auth.** Já decidido contra em `docs/adr/0005-manter-auth-propria.md`.
- **Hardening de infraestrutura (TLS/HTTPS via nginx+certificado, credenciais hardcoded do `docker-compose.yml`, porta do Postgres exposta ao host).** Descoberto durante o discovery desta rodada (2026-07-12) que essa camada tem natureza operacional diferente da hardening de aplicação — TLS real depende de domínio/certificado (não testável por `vitest`), verificação é manual/ops em vez de automatizada. Dono decidiu (Clarification 2026-07-12) escopar esta feature só pra camada de aplicação; infra vira item futuro (candidato a nota em `docs/roadmap.md` Fase 10, a confirmar na reconciliação).

## 5. Assumptions / Open questions

- Sem `[NEEDS CLARIFICATION:]` aberto — os 2 desta seção (timeout de 20s; UX de mensagem genérica) foram resolvidos em 2026-07-12, ver § 7 Clarifications.
- Premissa: manter tokens opacos (UUID) em vez de JWT — já é o padrão hoje e favorece revogação; hardening não deve reverter essa escolha (ver `docs/ach.md` § 3.1, Model/Adapter).
- **Premissa (2026-07-01, revisada após ADR-0009):** os critérios de sucesso da § 2 (expiração de sessão, rotação, CSRF, rate limiting, enumeração) são independentes de cache Redis — dependem do `Session` no Postgres (source of truth, `docs/ach.md` § 1) e da camada de cookie/procedure, não da leitura cacheada. Remover o Redis atual (ADR-0009) **não invalida** nenhum critério aqui; só significa que a implementação, quando chegar no `plan.md`, não deve reintroduzir cache como parte do hardening — isso é decisão separada, futura.
- **Premissa:** ADR-0006/0007 já foram implementadas; a implementação do hardening usa a estrutura atual (`models/`, `domain/`, `procedures/`), não a estrutura antiga (`entities/`, `controller.ts`/`service.ts`).

## 6. Dependências

- US-001, US-002, US-003 — todas `done` (base funcional já existe; esta feature é hardening, não construção do zero).
- `docs/adr/0005-manter-auth-propria.md` — decisão que motiva manter a auth própria em vez de trocar de lib.
- `docs/adr/0006-reorganizacao-server-por-feature.md`, `docs/adr/0007-entidades-prisma-em-server-models.md` — definem a estrutura atual usada pelo hardening.
- `docs/adr/0009-reconstruir-redis-do-zero.md` — confirma que os critérios desta feature não dependem de cache (ver Assumptions acima).

## 7. Clarifications

**2026-07-12 (discovery rodada 1/2, `/afm:deliver`):**

- **Q: o timeout de 20s (`EXPIRES = 1000 * 20`) é intencional ou debug leftover?** Resolvido por evidência de código, não perguntado ao dono: `Session` não tem coluna `expiresAt`, e esse é o **único** mecanismo de expiração hoje — 20s tornaria o app inutilizável em produção (qualquer aba parada por 20s vira `SESSION_EXPIRED`). Não é design intencional. `plan.md` § 4 define a política real (idle timeout + vida máxima absoluta).
- **Q: mensagem genérica em login/reset (perde clareza de UX) ou específica (aceita risco de enumeração)?** R: **Genérica em login/reset** (padrão OWASP). Registro continua revelando "email já existe" — esconder isso exigiria um fluxo de indireção maior, fora do escopo de hardening pontual.
- **Q: hardening de infra (TLS, docker-compose) entra nesta rodada ou fica pra depois?** R: **Só aplicação nesta rodada.** TLS real exige domínio+certificado (não testável por `vitest`), natureza operacional diferente do resto. Infra vira item separado (§ 4).

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
