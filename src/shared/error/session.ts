import { defineDomainErrors } from "./registry";

const SessionErrors = defineDomainErrors("session", {
	session_create_error: {
		httpCode: "INTERNAL_SERVER_ERROR",
		message: "Failed to create session. Please try again.",
		level: "error",
		retryable: true,
	},
	session_not_found: {
		httpCode: "NOT_FOUND",
		message: "Session not found.",
		level: "info",
	},
	// Historically both thrown with the same message ("Authentication token is
	// invalid.") but different httpCode depending on which lookup failed — kept
	// as distinct namespaced codes so each preserves its own httpCode exactly.
	refresh_token_invalid: {
		httpCode: "NOT_FOUND",
		message: "Authentication token is invalid.",
		level: "info",
		retryable: true,
	},
	access_token_invalid: {
		httpCode: "UNAUTHORIZED",
		message: "Authentication token is invalid.",
		level: "info",
		retryable: true,
	},
	session_update_error: {
		httpCode: "INTERNAL_SERVER_ERROR",
		message: "Failed to update session. Please try again.",
		level: "error",
		retryable: true,
	},
	session_expired: {
		httpCode: "UNAUTHORIZED",
		message: "Your session has expired. Please log in again.",
		level: "info",
		retryable: true,
	},
	missing_token: {
		httpCode: "UNAUTHORIZED",
		message: "Authentication token is missing.",
		level: "info",
	},
});

export { SessionErrors };
