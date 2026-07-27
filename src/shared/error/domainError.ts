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
