enum UserErrorCode {
  USER_NOT_FOUND = "USER_NOT_FOUND",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  USER_ALREADY_VERIFIED = "USER_ALREADY_VERIFIED",
  BIO_REQUIRED = "BIO_REQUIRED",
  BIO_MUST_BE_STRING = "BIO_MUST_BE_STRING",
  BIO_TOO_LONG = "BIO_TOO_LONG",
  // Profile validation errors
  PROFILE_NAME_REQUIRED = "PROFILE_NAME_REQUIRED",
  PROFILE_NAME_TOO_SHORT = "PROFILE_NAME_TOO_SHORT",
  PROFILE_EMAIL_REQUIRED = "PROFILE_EMAIL_REQUIRED", 
  PROFILE_INVALID_EMAIL = "PROFILE_INVALID_EMAIL"
}

const UserErrorMessages = {
  [UserErrorCode.USER_NOT_FOUND]: "User not found. Please check the email.",
  [UserErrorCode.USER_ALREADY_EXISTS]: "A user with this email already exists.",
  [UserErrorCode.USER_ALREADY_VERIFIED]: "User is already verified.",
  [UserErrorCode.BIO_REQUIRED]: "Bio is required.",
  [UserErrorCode.BIO_MUST_BE_STRING]: "Bio must be a string.",
  [UserErrorCode.BIO_TOO_LONG]: "Bio must be at most 500 characters long.",
  [UserErrorCode.PROFILE_NAME_REQUIRED]: "Name is required.",
  [UserErrorCode.PROFILE_NAME_TOO_SHORT]: "Name must be at least 3 characters long.",
  [UserErrorCode.PROFILE_EMAIL_REQUIRED]: "Email is required.",
  [UserErrorCode.PROFILE_INVALID_EMAIL]: "Invalid email format."
} as const;

export { UserErrorCode, UserErrorMessages };
