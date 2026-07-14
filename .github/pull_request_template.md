## Contexto

<!-- Qual fase do roadmap / RF / US isso atende, e por que essa mudança existe.
     Se existe docs/features/NNN-slug/, linka aqui (spec.md tem o problema, plan.md tem as decisões). -->

## O que mudou

<!-- Lista objetiva do que foi adicionado/alterado/removido. Área por área, não arquivo por arquivo
     (o diff já mostra os arquivos) — o que muda de comportamento observável. -->

## Decisões de design

<!-- Só o que NÃO é óbvio olhando o diff: trade-offs, alternativas rejeitadas e por quê,
     desvios de padrão existente. Se não houve decisão não-trivial, escreva "nenhuma". -->

## Como testar

<!-- Passos pra revisar rodando localmente: comandos, URLs, dados/fixtures necessários,
     o que observar pra confirmar que funciona. -->

## Checklist

- [ ] `npx tsc --noEmit` limpo
- [ ] `yarn test` verde
- [ ] `yarn build` verde (se a mudança toca rota/build)
- [ ] `/docs` atualizado se a mudança é load-bearing (regra dura, ADR, gotcha, spec/plan/tasks)
- [ ] Sem segredo no diff (`git diff main... | grep -nE "(token|secret|api[_-]?key|password|bearer)\s*[:=]\s*['\"][^'\"]+"` vazio)

## Fora de escopo / débito conhecido

<!-- O que foi deliberadamente deixado de fora nesta rodada, e por quê. -->
