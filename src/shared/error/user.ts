enum UserErrorCode {
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  USER_ALREADY_VERIFIED = "USER_ALREADY_VERIFIED"
}

const UserErrorMessages = {
  [UserErrorCode.USER_NOT_FOUND]: "User not found. Please check the email.",
  [UserErrorCode.USER_ALREADY_EXISTS]: "A user with this email already exists.",
  [UserErrorCode.USER_ALREADY_VERIFIED]: "User is already verified."
} as const;

export { UserErrorCode, UserErrorMessages };
