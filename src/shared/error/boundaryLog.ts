import { DomainError } from "./domainError";
import type { ErrorLevel } from "./registry";

type BoundaryErrorKind = "recoverable" | "bug";

type BoundaryClassification = {
	kind: BoundaryErrorKind;
	level: ErrorLevel;
	retryable: boolean;
	code: string | null;
};

// A recoverable error is (or wraps, as a TRPCError's cause) a DomainError; the
// boundary throws `new TRPCError({ ..., cause: domainError })`, so we look one
// level down. Anything else is an unexpected throw — a bug.
const findDomainError = (error: unknown): DomainError | null => {
	if (error instanceof DomainError) return error;

	if (
		typeof error === "object" &&
		error !== null &&
		"cause" in error &&
		error.cause instanceof DomainError
	) {
		return error.cause;
	}

	return null;
};

const classifyBoundaryError = (error: unknown): BoundaryClassification => {
	const domain = findDomainError(error);

	if (domain) {
		return {
			kind: "recoverable",
			level: domain.level,
			retryable: domain.retryable,
			code: domain.code,
		};
	}

	return { kind: "bug", level: "error", retryable: false, code: null };
};

const logBoundaryError = (
	error: unknown,
	context?: { path?: string | null },
): void => {
	const classification = classifyBoundaryError(error);
	const where = context?.path ? ` on ${context.path}` : "";
	const detail =
		classification.code ??
		(error instanceof Error ? error.message : "unknown error");
	const line = `[${classification.kind}${where}] ${detail}`;

	switch (classification.level) {
		case "fatal":
		case "error":
			// Bugs carry the full error (stack) so they stand out for debugging.
			if (classification.kind === "bug") console.error(line, error);
			else console.error(line);
			break;
		case "warn":
			console.warn(line);
			break;
		case "info":
			console.info(line);
			break;
	}
};

export { type BoundaryClassification, classifyBoundaryError, logBoundaryError };
