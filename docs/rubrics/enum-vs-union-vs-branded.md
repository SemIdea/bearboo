# Rubrica — enum vs union literal vs branded type vs Zod schema

## Tabela de decisão

| Caso | Escolha | Anti-pattern |
| --- | --- | --- |
| Valor existe no DB (status, role, plano) | **Enum do ORM** (Prisma enum, etc) — único caminho que sobrevive a `generate` | Enum TS puro espelhando o do ORM — duplicação |
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

- ❌ `enum Plan { FREE = "FREE", PRO = "PRO" }` em TS quando o Prisma já tem `enum Plan { FREE, PRO }` — usa o do Prisma direto.
- ❌ `type DistTag = string` aceitando qualquer coisa — usa union literal se fechado, ou Zod se aberto com regra.
- ❌ `copy(src: string, dst: string)` chamado como `copy(dst, src)` por engano — branded `SrcPath` e `DstPath` resolvem.
- ❌ Branded em todo `string` "por consistência" — overhead sem ganho de checagem.
