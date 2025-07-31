enum ResetTokenErrorCodes {
  TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND",
  TOKEN_ALREADY_USED = "TOKEN_ALREADY_USED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED"
}

const ResetTokenErrorMessages = {
  [ResetTokenErrorCodes.TOKEN_NOT_FOUND]:
    "Reset token not found. Please check the ID.",
  [ResetTokenErrorCodes.TOKEN_ALREADY_USED]:
    "This reset token has already been used.",
  [ResetTokenErrorCodes.TOKEN_EXPIRED]: "This reset token has expired."
} as const;

export { ResetTokenErrorCodes, ResetTokenErrorMessages };
