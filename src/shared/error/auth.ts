enum AuthErrorCode {
  MISSING_TOKEN = "MISSING_TOKEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  SESSION_CREATE_ERROR = "SESSION_CREATE_ERROR",
  SESSION_UPDATE_ERROR = "SESSION_UPDATE_ERROR",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_VERIFIED = "USER_NOT_VERIFIED",
  USER_NOT_LOGGED_IN = "USER_NOT_LOGGED_IN"
}

const AuthErrorMessages = {
  [AuthErrorCode.MISSING_TOKEN]: "Authentication token is missing.",
  [AuthErrorCode.INVALID_TOKEN]: "Authentication token is invalid.",
  [AuthErrorCode.SESSION_EXPIRED]:
    "Your session has expired. Please log in again.",
  [AuthErrorCode.SESSION_CREATE_ERROR]:
    "Failed to create session. Please try again.",
  [AuthErrorCode.SESSION_UPDATE_ERROR]:
    "Failed to update session. Please try again.",
  [AuthErrorCode.INVALID_CREDENTIALS]:
    "Invalid email or password. Please try again.",
  [AuthErrorCode.USER_NOT_VERIFIED]:
    "Your account is not verified. Please check your email.",
  [AuthErrorCode.USER_NOT_LOGGED_IN]:
    "You are not logged in. Please log in to continue."
} as const;

export { AuthErrorCode, AuthErrorMessages };
