import type { Logger } from "@/lib/log";
import { AppError } from "./appError";
import { resolveErrorEntry } from "./index";
import type { ErrorLevel } from "./registry";

type BoundaryErrorKind = "recoverable" | "bug";

type BoundaryClassification = {
	kind: BoundaryErrorKind;
	level: ErrorLevel;
	retryable: boolean;
	code: string | null;
};

// A recoverable error is (or wraps, as a TRPCError's cause) a AppError; the
// boundary throws `new TRPCError({ ..., cause: appError })`, so we look one
// level down. Anything else is an unexpected throw — a bug.
const findAppError = (error: unknown): AppError | null => {
	if (error instanceof AppError) return error;

	if (
		typeof error === "object" &&
		error !== null &&
		"cause" in error &&
		error.cause instanceof AppError
	) {
		return error.cause;
	}

	return null;
};

const classifyBoundaryError = (error: unknown): BoundaryClassification => {
	const appError = findAppError(error);

	if (appError) {
		// Resolved from the catalog rather than read off the instance: the
		// AppError carries identity, the registry carries policy.
		const { level, retryable } = resolveErrorEntry(appError.code);

		return { kind: "recoverable", level, retryable, code: appError.code };
	}

	return { kind: "bug", level: "error", retryable: false, code: null };
};

// Deposits the boundary classification onto the per-call logger, so the canonical
// line carries the error fields (ADR-0022). The logging middleware owns emission;
// this only enriches. A bug also carries its stack, the way the old console path
// did, so it stands out for debugging.
const depositBoundaryError = (log: Logger, error: unknown): void => {
	const { kind, level, retryable, code } = classifyBoundaryError(error);

	log.add({
		"error.kind": kind,
		"error.level": level,
		"error.retryable": retryable,
		"error.code": code,
	});

	if (kind === "bug" && error instanceof Error && error.stack) {
		log.add({ "error.stack": error.stack });
	}
};

export {
	type BoundaryClassification,
	classifyBoundaryError,
	depositBoundaryError,
	findAppError,
};
