# PRD — Bearboo

> Product Requirements Document. Documento vivo — editar in-place.
> Mudanças de escopo passam pelo dono do produto antes do merge.

## 1. Resumo

Bearboo é um blog técnico pessoal construído com foco em performance, organização de código e boas práticas modernas de desenvolvimento full-stack. Serve como repositório de estudos e demonstração prática de arquitetura (DDD-lite, camadas tipadas ponta-a-ponta) — não é um produto com base de usuários externa hoje.

Proposta de valor em uma frase: *"[A DEFINIR — validar com o dono do produto]"*

*(Origem: primeiros parágrafos do `README.md`.)*

## 2. Problema & Oportunidade

- **Dor observada:** não resolve dor de terceiros — é veículo de estudo e portfólio técnico do dono do produto (praticar arquitetura full-stack, type-safety ponta-a-ponta, boas práticas modernas em produção real).
- **Por que agora:** [A DEFINIR].
- **Tamanho do ganho:** demonstração prática e verificável de arquitetura (DDD-lite, tRPC, camadas testáveis) pra quem avalia o trabalho do dono do produto.

## 3. Usuário-alvo & Jobs-to-be-done

**Persona primária:** dupla — (a) o próprio dev (Bruno), escrevendo posts técnicos e evoluindo a arquitetura pra praticar; (b) recrutadores/leitores do portfólio, avaliando o código e o produto publicado.

**Empresas típicas:**
- [A DEFINIR — projeto pessoal, não se aplica hoje].

**Jobs-to-be-done:**
- Quando o Bruno quer praticar uma técnica/arquitetura nova, quero ter um projeto real pra aplicá-la para consolidar aprendizado e ter portfólio verificável.
- Quando um recrutador/dev avalia o Bruno, quero ver código de produção organizado e testado para formar uma opinião sobre a qualidade do trabalho.

**Cenários típicos:**
- "Bruno quer aprender X (ex: DDD, tRPC, ISR) e aplica no Bearboo pra fixar na prática."
- "Recrutador clona o repo, lê `/docs/` e o código, e avalia a arquitetura em minutos."

## 4. Requisitos Funcionais (RF)

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-01 | Autenticação de usuário — registro, login, logout e sessão com refresh automático (Postgres como source of truth; Redis cache removido e pendente de reconstrução futura). **Hardening de produção concluído** (`docs/features/001-auth-hardening/`): expiração real de sessão (idle + vida máxima), rotação de refresh token com detecção de reuse, cookies HttpOnly/SameSite=Lax (nunca mais em `document.cookie`/`localStorage`), rate limiting por endpoint, mensagens genéricas em login/reset contra enumeração de email. Hardening de infra (TLS, credenciais do `docker-compose.yml`) adiado — ver `docs/roadmap.md` | P0 |
| RF-02 | Verificação de email — token de verificação enviado por email, reenvio de token | P0 |
| RF-03 | Recuperação de senha — token de reset enviado por email, troca de senha | P0 |
| RF-04 | CRUD de posts — criar, ler, atualizar, deletar, revalidar (ISR) | P0 |
| RF-05 | CRUD de comentários em posts — criar, listar, atualizar, deletar | P0 |
| RF-06 | Perfil de usuário — editar nome/bio, visualizar posts e comentários publicados pelo usuário | P1 |
| RF-07 | Admin/CMS (autor) — autor controla status de publicação (draft/published/archived), vê preview do próprio post não publicado na URL real, gerencia todos os próprios posts com filtro por status/categoria/tag (`docs/roadmap.md` Fase 2); painel site-wide pra Admin/Editor via RF-08 (`013-role-based-permissions`) | P1 |
| RF-08 | Papéis e permissões (Admin/Editor/Author) — `docs/roadmap.md` Fase 3: Admin/Editor editam/deletam post de qualquer usuário e gerenciam categorias, Author só o próprio; Admin promove/rebaixa papel de outro usuário; painel de posts (RF-07) fica site-wide pra Admin/Editor. Restrição de publish/archive a Admin/Editor e workflow de revisão ficam pra Fase 4 (`013-role-based-permissions/spec.md` § 4) | P1 |
| RF-09 | Workflow editorial (revisão de posts) — `docs/roadmap.md` Fase 4: novos status `IN_REVIEW`/`SCHEDULED`; Author envia post pra revisão, Admin/Editor aprova/rejeita (com motivo obrigatório)/publica direto/agenda/arquiva; `PostReviewComment` guarda o histórico de aprovação/rejeição; agendamento resolvido via checagem lazy de visibilidade (sem scheduler novo). Histórico de diffs de edição (`PostRevision`) fica pra rodada futura (`014-post-review-workflow/spec.md` § 4) | P1 |
| RF-10 | SEO e publicação profissional — `docs/roadmap.md` Fase 5: sitemap.xml dinâmico, robots.txt, RSS feed, canonical URL, Twitter Card, schema.org (`Article` JSON-LD), tudo computado dos campos já existentes do post (sem migration). Slug amigável + redirect quando slug mudar e campos editáveis de override de SEO (`seoTitle`/`seoDescription`/`canonicalUrl`) ficam pra rodada futura (`015-seo-metadata/spec.md` § 4) | P1 |

*(RFs inferidos de `git log` — commits `feat:` de registro/login/sessão, verificação de token, reset de senha, CRUD de post/comentário, e edição de perfil. Ver histórico completo via `git log --oneline --grep=feat`.)*

**Nota de discrepância:** o `README.md` menciona "busca semântica de posts usando vetores de similaridade" nas funcionalidades atuais, mas nenhuma implementação (embeddings/pgvector/similarity) foi encontrada no código (`grep -rniE "embedding|vector|similarity|pgvector"` retorna vazio) — tratar como item de roadmap (`README.md` § Futuro), não RF implementado. [A DEFINIR — confirmar status real com o dono do produto.]

## 5. Requisitos Não-Funcionais (RNF)

| ID | Tipo | Critério |
| --- | --- | --- |
| RNF-01 | Disponibilidade | [A DEFINIR] |
| RNF-02 | Latência | [A DEFINIR] |
| RNF-03 | Segurança | Senhas hasheadas (bcrypt), tokens de sessão/verificação/reset com expiração e uso único (`used: Boolean`) |

*[A DEFINIR — thresholds numéricos.]*

## 6. Metas por Etapa

> **Plano de fases detalhado vive em [`docs/roadmap.md`](./roadmap.md)** — 12 fases (0 a 11), da organização inicial até observabilidade. Não duplicado aqui (fonte única); esta seção só posiciona o estado atual dentro desse plano.

### 6.1 MVP — estado atual

**Objetivo:** blog público + auth + CRUD de posts/comentários funcionando fim-a-fim (Fase 0 do roadmap concluída; Fase 1 "Blog público bem feito" parcialmente concluída).

**Escopo já implementado:** RF-01 a RF-07.

**Fase 1 do roadmap concluída** (com 1 pendência residual aceita — status HTTP de `/post/[slug]`, ver `docs/features/009-post-404-status/`). **Fase 2 concluída** (com 1 pendência adiada pra Fase 8 — upload de arquivo de capa). Ver `docs/roadmap.md` § Progresso geral pro detalhamento por feature.

**Nota de discrepância com o roadmap:** a "stack sugerida" da Fase 0 do roadmap lista Auth.js/Better Auth, Playwright e GitHub Actions. Playwright/GitHub Actions não foram adotados (testes são `vitest`, sem CI — `.github/workflows/` ausente, ver `ach.md` § CI/hooks). **Auth.js/Better Auth foi decisão explícita de não adotar — ver ADR-0005**: a auth própria (sessão opaca em `Session`, Postgres como source of truth) é mantida, com hardening incremental em vez de substituição por lib.

**Critério de aceite:** [A DEFINIR].

**Métrica de sucesso:** [A DEFINIR].

### 6.2 GTM — Fases 2-5 do roadmap

Admin/CMS (Fase 2), autenticação com papéis Admin/Editor/Author (Fase 3), workflow editorial DRAFT→IN_REVIEW→SCHEDULED/PUBLISHED (Fase 4), SEO completo (Fase 5). Ver `docs/roadmap.md` para funcionalidades, modelos e critérios de conclusão de cada fase.

### 6.3 First N — Fases 6-11 do roadmap

Busca (6), analytics interno (7), upload de mídia (8), qualidade de produção/testes (9), CI/CD e deploy (10), observabilidade (11).

## 7. Métricas & North Stars [A DEFINIR]

[A DEFINIR.]

## 8. Riscos & Mitigações [A DEFINIR]

| Risco | Impacto | Probabilidade | Mitigação |
| --- | --- | --- | --- |
| [A DEFINIR] | | | |

## 9. Não-escopo (v1)

- **Busca semântica de posts.** Mencionada no README como funcionalidade/futuro, sem implementação atual — fora de escopo até virar RF confirmado.
- **Tudo das Fases 3-11 do `docs/roadmap.md`** (papéis e permissões, workflow editorial, SEO completo, busca, analytics, upload de mídia, CI/CD, observabilidade) — planejado, não construído (Fase 2, admin/CMS, virou RF-07 e já está concluída). Não é "fora de escopo" permanente, é *ainda não* — cada fase entra como RF novo quando a implementação começar (ver § 4).

## 10. Glossário

- **User** — conta de usuário; autentica, publica posts, comenta. Atributos: `id, email, password, name, bio?, verified` (ver `prisma/schema.prisma`).
- **Session** — sessão de autenticação de um User, com `accessToken`/`refreshToken`. Atributos: `id, userId, accessToken, refreshToken` (ver `prisma/schema.prisma`).
- **Post** — conteúdo publicado por um User. Atributos: `id, userId, title, content` (ver `prisma/schema.prisma`).
- **Comment** — comentário de um User em um Post. Atributos: `id, postId, userId, content` (ver `prisma/schema.prisma`).
- **VerificationToken** — token de verificação de email de um User, com expiração e uso único. Atributos: `id, token, expiresAt, userId, used` (ver `prisma/schema.prisma`).
- **ResetToken** — token de reset de senha de um User, com expiração e uso único. Atributos: `id, token, expiresAt, userId, used` (ver `prisma/schema.prisma`).

## 11. Naming — produto vs identificadores técnicos

- **Produto user-facing:** "Bearboo" — usar em UI, emails, títulos, copy externa.
- **Identificadores técnicos NÃO mudam:**
  - `src/config/site.ts` ainda tem placeholder `"Next.js + HeroUI"` — [A DEFINIR: atualizar pro nome real do produto].
  - Demais identificadores técnicos (paths, env vars) não inventariados nesta adoção retroativa — crescem sob demanda.

---

*Estado atual e histórico vivo em `/docs/ust.md` (backlog) e `/docs/ach.md` (arquitetura). Decisões de processo em `/docs/afm.md`.*
