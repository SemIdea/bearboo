enum ValidationErrorCode {
  // Generic validation errors
  FIELD_REQUIRED = "FIELD_REQUIRED",
  FIELDS_REQUIRED = "FIELDS_REQUIRED",

  // Post validation errors (client-side)
  POST_TITLE_AND_CONTENT_REQUIRED = "POST_TITLE_AND_CONTENT_REQUIRED",
  POST_TITLE_TOO_SHORT_CLIENT = "POST_TITLE_TOO_SHORT_CLIENT",
  POST_CONTENT_TOO_SHORT_CLIENT = "POST_CONTENT_TOO_SHORT_CLIENT",

  // Comment validation errors (client-side)
  COMMENT_CONTENT_REQUIRED_CLIENT = "COMMENT_CONTENT_REQUIRED_CLIENT",
  COMMENT_CONTENT_TOO_SHORT_CLIENT = "COMMENT_CONTENT_TOO_SHORT_CLIENT",

  // User validation errors (client-side)
  USER_NAME_TOO_SHORT_CLIENT = "USER_NAME_TOO_SHORT_CLIENT",
  USER_EMAIL_INVALID_CLIENT = "USER_EMAIL_INVALID_CLIENT",
  USER_PASSWORD_TOO_SHORT_CLIENT = "USER_PASSWORD_TOO_SHORT_CLIENT"
}

const ValidationErrorMessages = {
  [ValidationErrorCode.FIELD_REQUIRED]: "This field is required.",
  [ValidationErrorCode.FIELDS_REQUIRED]: "All fields are required.",

  // Post validation messages
  [ValidationErrorCode.POST_TITLE_AND_CONTENT_REQUIRED]:
    "Both title and content are required to create a post.",
  [ValidationErrorCode.POST_TITLE_TOO_SHORT_CLIENT]:
    "Post title must be at least 3 characters long.",
  [ValidationErrorCode.POST_CONTENT_TOO_SHORT_CLIENT]:
    "Post content must be at least 10 characters long.",

  // Comment validation messages
  [ValidationErrorCode.COMMENT_CONTENT_REQUIRED_CLIENT]:
    "Comment content is required.",
  [ValidationErrorCode.COMMENT_CONTENT_TOO_SHORT_CLIENT]:
    "Comment must be at least 1 character long.",

  // User validation messages
  [ValidationErrorCode.USER_NAME_TOO_SHORT_CLIENT]:
    "Name must be at least 3 characters long.",
  [ValidationErrorCode.USER_EMAIL_INVALID_CLIENT]:
    "Please enter a valid email address.",
  [ValidationErrorCode.USER_PASSWORD_TOO_SHORT_CLIENT]:
    "Password must be at least 8 characters long."
} as const;

export { ValidationErrorCode, ValidationErrorMessages };
