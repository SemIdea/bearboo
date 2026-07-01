# Rubrica — template congelado (offline) vs. aprendizado streaming (online): precedência, nunca soma

> **Achado load-bearing do AWM (arXiv:2409.07429):** conhecimento **offline** (template arquitetural congelado via `export-template`) e **online** (aprendizado que o `reconcile`/`restructure` acumulam em streaming durante a vida do projeto) são **não-aditivos — combinar os dois machuca** (o resultado fica *entre* os dois e não bate nenhum). O AFM tem as duas camadas, então precisa de uma regra explícita de **precedência + tombstone**, jamais de fusão.

A regra única: quando offline e online colidem, **escolhe UM e tombstona o outro** (proveniência preservada). Nunca mantém os dois "somados", nunca funde o conteúdo.

## Tabela de decisão

| Situação | Regra |
| --- | --- |
| Projeto de **origem-template** (`docs/.template` foi a semente) E o `reconcile` quer propor regra/gotcha que **contradiz** um artefato herdado do template | **Streaming vence localmente.** Aplica a regra/gotcha nova e marca o artefato herdado com `*(overridden — ver reconcile NNN / ciclo NNN)*`. **NÃO funde** os dois (non-additivity: misturar = pior que qualquer um isolado). |
| O **mesmo conhecimento** existe no template congelado **E** numa learning streaming (duplicata, não contradição) | **Escolhe UM** (o mais recente/local em geral) e tombstona o outro. Proibido manter as duas cópias "somadas" — vira a inflação que o `diagnose A6` depois acusa. |
| `export-template` vai **congelar** um projeto que já acumulou learnings streaming | Consolida os learnings streaming **via `/afm:generalize` ANTES** do export — eles viram parte do template congelado (offline), não uma camada paralela. Evita congelar metade e deixar a outra metade pro reconcile do consumer colidir depois. |

## Por que não fundir

- **AWM mediu:** offline+online combinados ficam *entre* os dois e não batem nenhum. Fusão silenciosa é o pior dos mundos.
- **Tombstone, não deleção:** a precedência preserva a proveniência (o artefato perdedor vira nota, não some) — mesma disciplina do `generalize` (gotcha fundido vira tombstone) e do princípio #6 (deleção é bright line).
- **`reflect`/`generalize` continuam válidos** *dentro* de cada camada — o que esta rubrica proíbe é misturar **entre** camadas sem decidir a precedência.

## Antiexemplos

- ❌ Manter a regra herdada do template **e** a regra nova do reconcile que a contradiz, esperando que "as duas valham" — viola a non-additivity; decide a precedência.
- ❌ `export-template` congelar com learnings streaming pendentes sem consolidar antes — o consumer herda uma camada parcial que vai brigar com o próprio reconcile.
- ❌ Fundir o texto dos dois numa terceira versão "combinada" — é exatamente o resultado *entre os dois* que o AWM mostrou ser pior.
