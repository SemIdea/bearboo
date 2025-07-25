enum SessionErrorCode {
  MISSING_TOKEN = "MISSING_TOKEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  SESSION_CREATE_ERROR = "SESSION_CREATE_ERROR",
  SESSION_UPDATE_ERROR = "SESSION_UPDATE_ERROR"
}

const SessionErrorMessages = {
  [SessionErrorCode.MISSING_TOKEN]: "Authentication token is missing.",
  [SessionErrorCode.INVALID_TOKEN]: "Authentication token is invalid.",
  [SessionErrorCode.SESSION_EXPIRED]:
    "Your session has expired. Please log in again.",
  [SessionErrorCode.SESSION_CREATE_ERROR]:
    "Failed to create session. Please try again.",
  [SessionErrorCode.SESSION_UPDATE_ERROR]:
    "Failed to update session. Please try again."
} as const;

export { SessionErrorCode, SessionErrorMessages };