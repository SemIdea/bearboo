import { TRPCError } from "@trpc/server";
import { resolveErrorEntry } from "@/shared/error";
import { findAppError } from "@/shared/error/boundaryLog";
import { appErrorTransport } from "./appErrorTransport";

// The app-error → transport translation, centralized: every procedure
// inherits it through the `withAppErrors` middleware instead of repeating it.
//
// Returns `null` when the error is not an app error, so the caller can leave
// it alone: an unexpected throw is a bug and must keep reporting as one rather
// than being dressed up as a recoverable app error (regra 33).
const appErrorToTRPCError = (error: unknown): TRPCError | null => {
	const appError = findAppError(error);

	if (!appError) return null;

	// `message` comes from the catalog rather than from `appError.message`: the
	// AppError carries only identity, and the human-readable text is a
	// boundary concern (this is where i18n would eventually hook in).
	const { message } = resolveErrorEntry(appError.code);

	return new TRPCError({
		code: appErrorTransport[appError.code],
		message,
		// Preserved deliberately: errorFormatter reads it for `domainCode`,
		// logBoundaryError for the bug-vs-recoverable split, and caller.ts to
		// decide the session redirect.
		cause: appError,
	});
};

export { appErrorToTRPCError };
