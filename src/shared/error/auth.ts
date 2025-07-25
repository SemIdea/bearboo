enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_VERIFIED = "USER_NOT_VERIFIED",
  USER_NOT_LOGGED_IN = "USER_NOT_LOGGED_IN",
  EMAIL_REQUIRED = "EMAIL_REQUIRED",
  NAME_REQUIRED = "NAME_REQUIRED",
  PASSWORD_REQUIRED = "PASSWORD_REQUIRED",
  INVALID_EMAIL = "INVALID_EMAIL",
  NAME_TOO_SHORT = "NAME_TOO_SHORT",
  PASSWORD_TOO_SHORT = "PASSWORD_TOO_SHORT"
}

const AuthErrorMessages = {
  [AuthErrorCode.INVALID_CREDENTIALS]:
    "Invalid email or password. Please try again.",
  [AuthErrorCode.USER_NOT_VERIFIED]:
    "Your account is not verified. Please check your email.",
  [AuthErrorCode.USER_NOT_LOGGED_IN]:
    "You are not logged in. Please log in to continue.",
  [AuthErrorCode.EMAIL_REQUIRED]: "Email is required.",
  [AuthErrorCode.NAME_REQUIRED]: "Name is required.",
  [AuthErrorCode.PASSWORD_REQUIRED]: "Password is required.",
  [AuthErrorCode.INVALID_EMAIL]: "Invalid email format.",
  [AuthErrorCode.NAME_TOO_SHORT]: "Name must be at least 3 characters long.",
  [AuthErrorCode.PASSWORD_TOO_SHORT]:
    "Password must be at least 8 characters long."
};

export { AuthErrorCode, AuthErrorMessages };
