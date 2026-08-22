import { type ErrorCode, Errors } from "./index";
import type { ErrorLevel } from "./registry";

class DomainError extends Error {
	public readonly httpCode: (typeof Errors)[ErrorCode]["httpCode"];
	public readonly retryable: boolean;
	public readonly level: ErrorLevel;

	constructor(public readonly code: ErrorCode) {
		const entry = Errors[code];
		super(entry.message);
		this.httpCode = entry.httpCode;
		this.retryable = entry.retryable ?? false;
		this.level = entry.level ?? "warn";
		this.name = "DomainError";
	}
}

export { DomainError };
