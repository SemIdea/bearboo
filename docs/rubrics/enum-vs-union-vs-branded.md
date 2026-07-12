# Rubrica — enum vs union literal vs branded type vs Zod schema

## Tabela de decisão

| Caso | Escolha | Anti-pattern |
| --- | --- | --- |
| Valor existe no DB (status, role, plano) — **neste repo** | `enum` no `schema.prisma` pra persistência **+ union literal hand-rolled** no model do app (`src/server/models/<entity>.ts`, ex. `IPostStatus`/`IRole`), nunca o tipo gerado importado de `@prisma/client` fora de `infra/drivers/`/`test/prisma/` | Importar o tipo do Prisma client (`import { Role } from "@prisma/client"`) em domain/procedure/lib — acopla o app ao client gerado onde o resto do código já não faz isso |
| ≤ 5 valores fechados, só vivem em código | **Union literal** (`"latest" \| "next" \| "beta"`) | Enum TS puro — gera lixo de transpilação, não tree-shakeable |
| String aberta com regra (user-input, dist-tag livre) | **Schema parser** (Zod) + parse no boundary | Validar dentro do domain (viola regra dura 16) |
| Primitivo com invariante semântica (sha256, userId ≠ sessionId, currency cents) | **Branded type** (`type Hash = string & { __brand: "Hash" }`) | `string` cru — perde checagem em call-site |
| Valor opaco vindo de SDK externo (Stripe price id) | Tipo da SDK + Zod no boundary | Re-tipar como branded — duplica SDK |

## Quando branded type vence

- Função aceita 2 strings com semântica diferente (`copy(from: string, to: string)`) — branded evita trocar ordem.
- Hash, ID, currency em cents, timestamp em ms vs s — branded torna conversão explícita.
- ID de domínio diferente (UserId vs SessionId vs OrgId) — branded evita passar UserId onde pediu OrgId.

## Quando branded type NÃO compensa

- String que vai pra log, UI, network — leitor não ganha nada.
- Tipo já vem da SDK como string opaca — re-tipar duplica.
- Função tem 1 parâmetro — sem ambiguidade pra resolver.

## Antiexemplos

- ❌ `enum Plan { FREE = "FREE", PRO = "PRO" }` em TS (enum de verdade, não union) quando o Prisma já tem `enum Plan { FREE, PRO }` — usa union literal (`"FREE" | "PRO"`) hand-rolled no model, não um enum TS espelhado nem o tipo importado de `@prisma/client` (ver linha da tabela acima — corrigido 2026-07-12 após achar o precedente real, `IPostStatus`/`IRole`, durante `013-role-based-permissions`).
- ❌ `type DistTag = string` aceitando qualquer coisa — usa union literal se fechado, ou Zod se aberto com regra.
- ❌ `copy(src: string, dst: string)` chamado como `copy(dst, src)` por engano — branded `SrcPath` e `DstPath` resolvem.
- ❌ Branded em todo `string` "por consistência" — overhead sem ganho de checagem.
