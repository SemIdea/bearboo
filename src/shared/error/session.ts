enum SessionErrorCode {
  MISSING_TOKEN = "MISSING_TOKEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  SESSION_CREATE_ERROR = "SESSION_CREATE_ERROR",
  SESSION_UPDATE_ERROR = "SESSION_UPDATE_ERROR",
  SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
  SESSION_NOT_AUTHORIZED = "SESSION_NOT_AUTHORIZED"
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
    "You are not authorized to perform this action."
} as const;

export { SessionErrorCode, SessionErrorMessages };
