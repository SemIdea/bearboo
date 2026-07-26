# Feature 021 — Upload e gerenciamento de mídia

> **Spec:** o quê e o porquê. Sem decisão de tecnologia.
> **US relacionada(s):** US-016 (Usuário autenticado envia e gerencia mídia)
> **Status:** done (2026-07-26 — `tsc --noEmit` limpo, `vitest` 364/364 verdes incl. 17 testes novos; migration `20260726015219_add_media` aplicada e verificada contra um Postgres real via Docker; fluxo completo — upload/list/delete — testado ao vivo contra um `next dev` real via `curl -F` multipart, incl. arquivo servido de volta em `/uploads/<key>`)
> **Data de abertura:** 2026-07-26

## 1. Problema (do PRD/UST)

`docs/roadmap.md` Fase 8 lista upload/gerenciamento de mídia como não iniciada. Hoje a única forma de associar uma imagem a um post é colar uma URL externa já hospedada em outro lugar (`010-post-cover-image`) — o Autor/Editor/Admin (persona única deste épico, RF-13) não tem como enviar um arquivo próprio, então depende de um host de imagem de terceiros só pra publicar. Não existe biblioteca de mídia, nem forma de reusar/apagar o que já foi enviado.

## 2. Critério de sucesso observável

- [x] Usuário autenticado envia um arquivo de imagem e ele aparece na própria biblioteca de mídia, com URL pública utilizável.
- [x] Upload com formato ou tamanho fora do permitido é rejeitado antes de qualquer escrita em disco.
- [x] Usuário vê e apaga só a própria mídia; Admin/Editor veem e apagam mídia de qualquer usuário.
- [x] Ao criar/editar um post, é possível escolher uma mídia já enviada como imagem de capa (preenche o `coverImageUrl` já existente).
- [x] Texto alternativo (`altText`) é opcional no upload.
- [ ] ~~Texto alternativo editável depois do upload~~ — não implementado nesta rodada (nenhum cenário Gherkin da US-016 cobre edição pós-upload; o bullet original deste critério previa mais do que o escopo aprovado no gate entregava — corrigido aqui em vez de marcado como feito). Só existe `media.upload`/`readOwn`/`delete`, sem `media.update`. Movido pra § 4 Out of scope.

## 3. Cenários

```gherkin
Scenario: Upload de imagem válida
  Given um usuário autenticado
  When ele envia um arquivo JPEG de 2MB com texto alternativo "foto do evento"
  Then a mídia é salva e aparece na biblioteca do usuário com a URL pública

Scenario: Upload rejeitado por formato inválido
  Given um usuário autenticado
  When ele envia um arquivo .pdf
  Then o upload é rejeitado antes de tocar o storage

Scenario: Upload rejeitado por tamanho excedido
  Given um usuário autenticado
  When ele envia uma imagem de 8MB (acima do limite configurado)
  Then o upload é rejeitado antes de tocar o storage

Scenario: Usuário vê só a própria biblioteca
  Given dois usuários, cada um com mídia enviada
  When um deles lista a própria biblioteca
  Then só a mídia que ele mesmo enviou aparece

Scenario: Dono apaga a própria mídia
  Given um usuário dono de uma mídia
  When ele apaga essa mídia
  Then o registro e o arquivo físico deixam de existir

Scenario: Usuário sem permissão não apaga mídia de outro
  Given um usuário Author sem bypass de permissão
  When ele tenta apagar mídia enviada por outro usuário
  Then a operação é rejeitada

Scenario: Admin/Editor apaga mídia de qualquer usuário
  Given um usuário com papel Admin ou Editor
  When ele apaga mídia enviada por outro usuário
  Then a mídia é removida normalmente

Scenario: Mídia enviada vira capa do post
  Given um usuário com uma mídia já enviada
  When ele escolhe essa mídia como capa ao criar/editar um post
  Then o post passa a usar a URL pública da mídia como coverImageUrl
```

## 4. Out of scope

- Compressão/otimização automática de imagem (`sharp` ou equivalente) — explicitamente opcional no roadmap; adicionaria dependência nova sem demanda confirmada nesta rodada. Se o storage final vier a ser um CDN de imagem com transformação nativa (ex. Cloudinary), isso se torna desnecessário; decisão adiada até lá.
- Implementação concreta de storage em nuvem (S3/R2/Cloudinary) — o port (`mediaStorage` gateway) é desenhado pra suportar isso sem reabrir domain/procedure, mas só a implementação local (`public/uploads/`) entra nesta rodada (decisão do dono, 2026-07-26).
- Vídeo ou outros tipos de mídia além de imagem — fora do critério de sucesso desta rodada.
- Redimensionamento/crop no upload — a imagem é salva como enviada.
- Editar `altText` depois do upload (`media.update`) — só `upload`/`readOwn`/`delete` existem; corrigir o alt text hoje exige apagar e reenviar. Nenhum cenário Gherkin da US-016 cobre isso; adicionado tarde demais no rascunho do § 2 e removido de lá.

## 5. Assumptions / Open questions

- Limite de tamanho: 5MB por arquivo (default configurável via env, sem pedido explícito de outro valor).
- Formatos aceitos: JPEG, PNG, WebP, GIF (formatos web comuns; sem pedido de formato adicional).
- Permissão de apagar mídia de terceiros segue o mesmo padrão já usado por `post:deleteAny` (Admin/Editor via bypass, RF-08) — sem matriz de permissão nova, reusa `docs/lib/permissions`.
- Sem `[NEEDS CLARIFICATION:]` — discovery (`/afm:deliver`) resolveu storage/transporte via scan do código antes do gate; decisão de qual storage concreto construir nesta rodada (local vs. Cloudinary) foi ao dono no gate e ficou registrada acima.

## 6. Dependências

Nenhuma migration em `Post`. Reusa `Post.coverImageUrl` (`010-post-cover-image`) e o helper `permissions` (`013-role-based-permissions`).

## 7. Clarifications

_(vazio)_

---

*Spec NÃO contém: decisão de stack, nomes de função, schema de DB, ordem de tasks. Isso vai pro `plan.md`.*
