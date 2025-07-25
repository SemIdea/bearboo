enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_VERIFIED = "USER_NOT_VERIFIED",
  USER_NOT_LOGGED_IN = "USER_NOT_LOGGED_IN"
}

const AuthErrorMessages = {
  [AuthErrorCode.INVALID_CREDENTIALS]:
    "Invalid email or password. Please try again.",
  [AuthErrorCode.USER_NOT_VERIFIED]:
    "Your account is not verified. Please check your email.",
  [AuthErrorCode.USER_NOT_LOGGED_IN]:
    "You are not logged in. Please log in to continue."
} as const;

export { AuthErrorCode, AuthErrorMessages };
