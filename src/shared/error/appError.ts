import type { ErrorCode } from "./index";

// Carries identity (the code), nothing else. Everything else about an error is
// a static function of the code, so consumers resolve what they need from the
// registry (`resolveErrorEntry`) or, for transport, from `appErrorTransport`
// — the domain vocabulary stays free of transport concerns. See ADR-0019.
//
// `super(code)` deliberately uses the code as the Error message: stack traces
// stay readable and the human-readable text is resolved at the boundary, where
// i18n would eventually belong.
class AppError extends Error {
	constructor(public readonly code: ErrorCode) {
		super(code);
		this.name = "AppError";
	}
}

export { AppError };
