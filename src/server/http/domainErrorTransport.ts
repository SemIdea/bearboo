import type { TRPC_ERROR_CODE_KEY } from "@trpc/server";
import type { ErrorCode } from "@/shared/error";

// How a domain error is projected onto the tRPC transport.
//
// This lives on the server side, not in the catalog, because the projection is
// one consumer's opinion — not a property of the error. The domain names what
// went wrong; this table decides how *this* transport reports it. A second
// consumer (a job runner mapping to exit codes, say) gets its own table
// instead of adding a column to every catalog entry.
//
// `Record<ErrorCode, ...>` makes the mapping total: a new error code without an
// entry here fails `tsc --noEmit` rather than falling through to a 500.
const domainErrorTransport: Record<ErrorCode, TRPC_ERROR_CODE_KEY> = {
	"auth.invalid_credentials": "UNAUTHORIZED",
	"auth.user_not_verified": "FORBIDDEN",
	"auth.user_not_logged_in": "UNAUTHORIZED",
	"auth.too_many_attempts": "TOO_MANY_REQUESTS",
	"auth.insufficient_role": "FORBIDDEN",

	"comment.not_found": "NOT_FOUND",
	"comment.delete_forbidden": "FORBIDDEN",
	"comment.update_forbidden": "FORBIDDEN",

	"media.not_found": "NOT_FOUND",
	"media.delete_forbidden": "FORBIDDEN",

	"post.not_found": "NOT_FOUND",
	"post.update_forbidden": "FORBIDDEN",
	"post.delete_forbidden": "FORBIDDEN",
	"post.invalid_status_transition": "BAD_REQUEST",

	"resetToken.not_found": "NOT_FOUND",
	"resetToken.already_used": "FORBIDDEN",
	"resetToken.expired": "FORBIDDEN",

	// `refresh_token_invalid` and `access_token_invalid` share a message but not
	// a status: the refresh lookup reports NOT_FOUND, the access lookup reports
	// UNAUTHORIZED. Kept distinct on purpose (see the note in session.ts).
	"session.session_create_error": "INTERNAL_SERVER_ERROR",
	"session.session_not_found": "NOT_FOUND",
	"session.refresh_token_invalid": "NOT_FOUND",
	"session.access_token_invalid": "UNAUTHORIZED",
	"session.session_update_error": "INTERNAL_SERVER_ERROR",
	"session.session_expired": "UNAUTHORIZED",
	"session.missing_token": "UNAUTHORIZED",

	"user.not_found": "NOT_FOUND",
	"user.already_exists": "CONFLICT",

	"verifyToken.not_found": "NOT_FOUND",
	"verifyToken.already_used": "BAD_REQUEST",
	"verifyToken.expired": "BAD_REQUEST",
};

export { domainErrorTransport };
