import { defineDomainErrors } from "../registry";

const SessionErrors = defineDomainErrors("session", {
	session_create_error: {
		message: "Failed to create session. Please try again.",
		level: "error",
		retryable: true,
	},
	session_not_found: {
		message: "Session not found.",
		level: "info",
	},
	// `refresh_token_invalid` and `access_token_invalid` share this message but
	// not their transport code — the refresh lookup reports NOT_FOUND, the
	// access lookup UNAUTHORIZED. Kept as distinct codes so each keeps its own
	// projection; see `src/server/http/domainErrorTransport.ts`.
	refresh_token_invalid: {
		message: "Authentication token is invalid.",
		level: "info",
		retryable: true,
	},
	access_token_invalid: {
		message: "Authentication token is invalid.",
		level: "info",
		retryable: true,
	},
	session_update_error: {
		message: "Failed to update session. Please try again.",
		level: "error",
		retryable: true,
	},
	session_expired: {
		message: "Your session has expired. Please log in again.",
		level: "info",
		retryable: true,
	},
	missing_token: {
		message: "Authentication token is missing.",
		level: "info",
	},
});

export { SessionErrors };
