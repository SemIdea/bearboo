import type { ErrorCode } from "./index";

// Carries identity, nothing else.
//
// It used to copy `httpCode`/`message`/`retryable`/`level` off the catalog onto
// itself, which meant a domain error knew its own transport code — and the
// domain then started branching on it. Everything but the code is a static
// function of the code, so consumers resolve what they need from the registry
// (`resolveErrorEntry`) or, for transport, from `domainErrorTransport`.
//
// `super(code)` makes the code the Error message: stack traces stay readable
// and the human-readable text is resolved at the boundary, which is where i18n
// would eventually belong.
class DomainError extends Error {
	constructor(public readonly code: ErrorCode) {
		super(code);
		this.name = "DomainError";
	}
}

export { DomainError };
