import { TRPCError } from "@trpc/server";
import { resolveErrorEntry } from "@/shared/error";
import { findDomainError } from "@/shared/error/boundaryLog";
import { domainErrorTransport } from "./domainErrorTransport";

// The domain-error → transport translation, centralized: every procedure
// inherits it through the `withDomainErrors` middleware instead of repeating it.
//
// Returns `null` when the error is not a domain error, so the caller can leave
// it alone: an unexpected throw is a bug and must keep reporting as one rather
// than being dressed up as a recoverable domain error (regra 33).
const domainErrorToTRPCError = (error: unknown): TRPCError | null => {
	const domain = findDomainError(error);

	if (!domain) return null;

	// `message` comes from the catalog rather than from `domain.message`: the
	// DomainError carries only identity, and the human-readable text is a
	// boundary concern (this is where i18n would eventually hook in).
	const { message } = resolveErrorEntry(domain.code);

	return new TRPCError({
		code: domainErrorTransport[domain.code],
		message,
		// Preserved deliberately: errorFormatter reads it for `domainCode`,
		// logBoundaryError for the bug-vs-recoverable split, and caller.ts to
		// decide the session redirect.
		cause: domain,
	});
};

export { domainErrorToTRPCError };
