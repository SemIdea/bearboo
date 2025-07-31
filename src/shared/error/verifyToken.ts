enum VerifyTokenErrorCodes {
  TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND",
  TOKEN_ALREADY_USED = "TOKEN_ALREADY_USED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED"
}

const VeriifyTokenErrorMessages = {
  [VerifyTokenErrorCodes.TOKEN_NOT_FOUND]:
    "Token not found. Please check the ID.",
  [VerifyTokenErrorCodes.TOKEN_ALREADY_USED]:
    "This token has already been used.",
  [VerifyTokenErrorCodes.TOKEN_EXPIRED]: "This token has expired."
} as const;

export { VerifyTokenErrorCodes, VeriifyTokenErrorMessages };
