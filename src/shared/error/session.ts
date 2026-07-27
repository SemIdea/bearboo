import { defineDomainErrors } from "./registry";

enum SessionErrorCode {
	MISSING_TOKEN = "MISSING_TOKEN",
	INVALID_TOKEN = "INVALID_TOKEN",
	SESSION_EXPIRED = "SESSION_EXPIRED",
	SESSION_CREATE_ERROR = "SESSION_CREATE_ERROR",
	SESSION_UPDATE_ERROR = "SESSION_UPDATE_ERROR",
	SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
	SESSION_NOT_AUTHORIZED = "SESSION_NOT_AUTHORIZED",
}

const SessionErrorMessages = {
	[SessionErrorCode.MISSING_TOKEN]: "Authentication token is missing.",
	[SessionErrorCode.INVALID_TOKEN]: "Authentication token is invalid.",
	[SessionErrorCode.SESSION_EXPIRED]:
		"Your session has expired. Please log in again.",
	[SessionErrorCode.SESSION_CREATE_ERROR]:
		"Failed to create session. Please try again.",
	[SessionErrorCode.SESSION_UPDATE_ERROR]:
		"Failed to update session. Please try again.",
	[SessionErrorCode.SESSION_NOT_FOUND]: "Session not found.",
	[SessionErrorCode.SESSION_NOT_AUTHORIZED]:
		"You are not authorized to perform this action.",
} as const;

const SessionErrors = defineDomainErrors("session", {
	session_create_error: {
		httpCode: "INTERNAL_SERVER_ERROR",
		message: SessionErrorMessages[SessionErrorCode.SESSION_CREATE_ERROR],
	},
	session_not_found: {
		httpCode: "NOT_FOUND",
		message: SessionErrorMessages[SessionErrorCode.SESSION_NOT_FOUND],
	},
	// Historically both thrown with the same message (SessionErrorCode.INVALID_TOKEN)
	// but different httpCode depending on which lookup failed — kept as distinct
	// namespaced codes so each preserves its own httpCode exactly.
	refresh_token_invalid: {
		httpCode: "NOT_FOUND",
		message: SessionErrorMessages[SessionErrorCode.INVALID_TOKEN],
	},
	access_token_invalid: {
		httpCode: "UNAUTHORIZED",
		message: SessionErrorMessages[SessionErrorCode.INVALID_TOKEN],
	},
	session_update_error: {
		httpCode: "INTERNAL_SERVER_ERROR",
		message: SessionErrorMessages[SessionErrorCode.SESSION_UPDATE_ERROR],
	},
});

export { SessionErrorCode, SessionErrorMessages, SessionErrors };
