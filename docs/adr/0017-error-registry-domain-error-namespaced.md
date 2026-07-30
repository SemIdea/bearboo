# ADR-0017 — ErrorRegistry: código de domínio namespaced (`"auth.invalid_credentials"`) resolvido em `DomainError`

> **Status:** Aceita
> **Data:** 2026-07-26
> **Decidido por:** SemIdea

## Contexto

ADR-0016 propôs centralizar o mapeamento `DomainError` → `TRPCError` no `errorFormatter`, mas manteve o `code` do domínio genérico (`DomainError<C extends string>`) e um mapeamento code→HTTP separado que ainda exigia algum se de comparação por feature.

Discussão de design em `docs/research/004-error-handler-patterns.md` (seção de iteração colaborativa, 2026-07-26) evoluiu essa ideia através de várias rodadas — hierarquia `XError extends Error`, `Result<T,E>`, `DomainError(httpCode, message)`, objeto único por erro, string namespaced com parsing em runtime — até convergir num desenho que resolve o objetivo original do ADR-0016 (matar o switch/if-chain na procedure) sem os efeitos colaterais encontrados no caminho: perda de granularidade pro frontend (`getErrorMessage`), acoplamento da classe base a todas as features, e perda de checagem em compile-time.

Este ADR **substitui ADR-0016** com o desenho final.

## Decisão

**Cada domínio se registra no `ErrorRegistry` via `defineDomainErrors(domain, errors)`, que monta o código namespaced automaticamente (`"<domain>.<code>"`) e valida duplicação de domínio em runtime.** `DomainError` passa a ter um único parâmetro (`code: ErrorCode`, o union global derivado do registry) e resolve `httpCode`/`message` sozinho — nenhuma procedure precisa de switch, if-chain, ou até import de qualquer `<Feature>Errors`.

Peças, com path definitivo:

**`src/shared/error/registry.ts`** (novo) — o `ErrorRegistry`:
```ts
type ErrorEntry = { httpCode: TRPC_ERROR_CODE_KEY; message: string };

const registeredDomains = new Set<string>();

function defineDomainErrors<D extends string, E extends Record<string, ErrorEntry>>(
	domain: D,
	errors: E,
) {
	if (registeredDomains.has(domain)) {
		throw new Error(`ErrorRegistry: domain "${domain}" already registered.`);
	}
	registeredDomains.add(domain);

	return Object.fromEntries(
		Object.entries(errors).map(([code, entry]) => [`${domain}.${code}`, entry]),
	) as { [K in keyof E as `${D}.${string & K}`]: E[K] };
}

export { defineDomainErrors, type ErrorEntry };
```

**`src/shared/error/<feature>.ts`** (os 9 arquivos existentes, reescritos) — cada um declara seu domínio uma vez, sem repetir o prefixo em cada chave:
```ts
const AuthErrors = defineDomainErrors("auth", {
	invalid_credentials: { httpCode: "UNAUTHORIZED", message: "Invalid email or password. Please try again." },
	user_not_verified: { httpCode: "FORBIDDEN", message: "Your account is not verified. Please check your email." },
});
export { AuthErrors };
```

**`src/shared/error/index.ts`** (novo) — agregador fino, não cresce além de imports+spread:
```ts
import { AuthErrors } from "./auth";
import { MediaErrors } from "./media";
// ... um import por domínio

const Errors = { ...AuthErrors, ...MediaErrors } as const;
type ErrorCode = keyof typeof Errors;
export { Errors, type ErrorCode };
```

**`src/shared/error/domainError.ts`** (reescrito) — resolve `httpCode`/`message` a partir do `code`:
```ts
import { Errors, type ErrorCode } from "./index";

class DomainError extends Error {
	public readonly httpCode: (typeof Errors)[ErrorCode]["httpCode"];
	constructor(public readonly code: ErrorCode) {
		const entry = Errors[code];
		super(entry.message);
		this.httpCode = entry.httpCode;
		this.name = "DomainError";
	}
}
export { DomainError };
```

Call site no domain — um import só, autocomplete do catálogo inteiro:
```ts
throw new DomainError("auth.invalid_credentials");
```

Boundary — mesmo bloco em toda procedure (candidato natural a virar o `errorFormatter` do ADR-0016, agora trivial):
```ts
} catch (error) {
	if (error instanceof DomainError) {
		throw new TRPCError({ code: error.httpCode, message: error.message });
	}
	throw error;
}
```

Este ADR **não resolve** a violação da regra dura 15 nos ~23-24 arquivos `domain/` que hoje lançam `TRPCError` direto (dívida forward-only, `docs/afm.md` § 3.1) — a migração cobre a infraestrutura de erro (registry + `DomainError` + os 9 arquivos de catálogo); domains que já violam a regra migram via boy-scout quando forem tocados, não em mutirão.

## Alternativas consideradas

- **`DomainError<C extends string>` genérico com `code` livre + mapa de httpCode separado por feature** (ADR-0016 original) — rejeitada: ainda exigia alguma forma de lookup/switch na procedure ou no `errorFormatter`; o registry elimina isso completamente.
- **Hierarquia de classes (`EmailTakenError extends DomainError`, uma por erro)** — rejeitada: sem exhaustiveness check em `instanceof` chains (esquecer um branch cai silenciosamente no catch-all), e multiplica classes (~50-90 error codes hoje) sem ganho proporcional sobre o objeto de catálogo.
- **`Result<T,E>` em vez de throw** — rejeitada: quebra com o padrão já em produção (`domain_*` já lança `DomainError`, não retorna `Result`); o call depth do projeto é raso (domain → 1 procedure), então o argumento de Railway Oriented Programming (evitar poluir camadas intermediárias) não se aplica aqui com força.
- **`DomainError("auth.invalid_credentials")` fazendo `split(".")` e lookup dentro do próprio construtor, sem `ErrorRegistry`** — rejeitada: sem `defineDomainErrors`, a validação de que a string existe vira runtime-only (string solta, sem union literal derivado), perdendo autocomplete/compile-safety; e a classe base precisaria importar todos os domínios diretamente.
- **`code` do `DomainError` = HTTP status direto (`"BAD_REQUEST"`, sem granularidade de domínio)** — rejeitada: colide com o uso real do frontend (`src/lib/error.ts:16-30`, `getErrorMessage`), que depende de códigos finos (ex. 6 codes diferentes de `auth.ts` mapeiam pro mesmo `BAD_REQUEST` hoje) pra achar a mensagem certa.

## Consequência

**Fica fácil:** adicionar um erro novo é uma entrada no objeto do domínio certo — sem tocar `domainError.ts`, sem editar procedure nenhuma, sem repetir o prefixo do domínio. Toda procedure trata erro de domínio com o mesmo bloco de 4 linhas, ou nem isso se virar `errorFormatter` global. Typo no `code` quebra o build (via `ErrorCode` derivado de `keyof typeof Errors`), não em runtime.

**Fica difícil / gotcha:** dois domínios reivindicando o mesmo namespace só é pego em runtime, na primeira vez que ambos os arquivos forem importados (module load, não compile-time) — se um domínio nunca for importado por engano, a checagem de duplicação não dispara pra ele (mitigado: `index.ts` importa todos os domínios sempre, então isso só ocorreria se um arquivo de feature novo esquecesse de ser adicionado no agregador — nesse caso o erro dessa feature simplesmente não aparece no `ErrorCode` union, um sintoma visível na hora de tentar usá-lo).

**Débito aceito (fechado):** os ~23-24 arquivos `domain/` que lançavam `TRPCError` direto migraram em `022-error-registry` (2026-07-27). O resto do débito — `auth`/`session`/`post` mantendo o enum legado lado a lado por terem consumidor fora da camada de domínio (`createRouter.ts`, `caller.ts`, `sessionRefreshLink.ts`, `recordView.ts`) — fechou em 2026-07-30: todos os pontos migraram pra sintetizar `DomainError` no boundary, e os 3 catálogos fizeram cutover total do enum antigo. Não há mais débito rastreado desta ADR.

## Referências

- Commit: (a implementar)
- Substitui: ADR-0016
- Doc canônico: `docs/rubrics/error-classification.md`, `docs/research/004-error-handler-patterns.md`
- Regra dura relacionada: `docs/afm.md` § 3 regra 15, § 3.1 (forward-only)
