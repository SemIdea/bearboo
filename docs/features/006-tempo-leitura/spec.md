# Feature 006 — Tempo estimado de leitura

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** nenhuma US formal ainda — item de checklist em `docs/roadmap.md` Fase 1 ("tempo estimado de leitura").
> **Status:** done (2026-07-12 — verificado ao vivo contra o dev server real via `curl` em `post.readRecent`/`post.readBySlug`; `tsc --noEmit` e `vitest` 145/145 verdes)
> **Data de abertura:** 2026-07-12

## 1. Problema (do PRD/UST)

`Post` não expõe um tempo estimado de leitura. O roadmap já lista o item na Fase 1, mas ele não existe hoje — quem lê a listagem do blog ou um post individual não tem uma noção rápida de quanto tempo o conteúdo leva pra ler (comum em blogs técnicos, ex.: "5 min de leitura").

## 2. Critério de sucesso observável

- [x] Todo post retornado por qualquer endpoint público (`post.create`, `post.read`, `post.readBySlug`, `post.readRecent`, `post.update`, `post.revalidate`, `user.readPosts`) inclui `readingTimeMinutes: number` — testado (`vitest`) e verificado ao vivo via `curl`.
- [x] O valor é sempre um inteiro `>= 1` (nunca "0 min de leitura", mesmo pra post muito curto) — testado.
- [x] O valor é derivado só do `content` do post — dois posts com o mesmo `content` têm o mesmo `readingTimeMinutes`, independente de status/categoria/tags — garantido pela implementação (`calculateReadingTimeMinutes` só recebe `content`).

## 3. Cenários (Gherkin)

```gherkin
Scenario: Post curto tem no mínimo 1 minuto de leitura
  Given um post com poucas palavras no content
  When o post é lido por qualquer rota pública
  Then readingTimeMinutes é 1

Scenario: Post longo tem tempo de leitura proporcional ao tamanho
  Given dois posts, um com o dobro de palavras do outro
  When ambos são lidos
  Then o post mais longo tem readingTimeMinutes maior ou igual ao do post mais curto

Scenario: Tempo de leitura aparece em todas as rotas que retornam post
  Given um post publicado
  When ele é lido via readRecent, readBySlug e user.readPosts
  Then todas as três respostas incluem readingTimeMinutes
```

## 4. Out of scope

- **UI mostrando "N min de leitura".** Mesma diretriz das features 004/005 — mudanças de front ficam mínimas até a refatoração de front planejada (`docs/roadmap.md` § Nota de sequenciamento). O campo fica disponível na API, sem tela consumindo ainda.
- **Configuração de velocidade de leitura (palavras/minuto) por usuário/idioma.** Usa uma constante fixa (ver `plan.md` § 4) — não há requisito de personalização.
- **Persistir o valor no banco.** É sempre calculado on-the-fly a partir do `content` já existente — não é um dado novo armazenado, evita ficar desatualizado se o post for editado.

## 5. Assumptions / Open questions

- Premissa: velocidade de leitura de 200 palavras/minuto (média adulta comumente citada, mesma ordem de grandeza usada por blogs como Medium) — não há requisito do dono do produto especificando um valor diferente; resolvido por convenção de mercado, documentado em `plan.md` § 4.
- Premissa: contagem de palavras via split por espaço em branco no `content` bruto (sem stripar markdown) — aproximação padrão da indústria, suficiente pro objetivo (dar uma noção, não um valor exato).

## 6. Dependências

- Nenhuma feature bloqueante. Não depende de `002`/`003`/`004`/`005`.

## 7. Clarifications

*(vazio — discovery convergiu sem decisão irredutível; ver `plan.md` § 4 para o raciocínio de cada decisão.)*

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
