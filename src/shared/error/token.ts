enum TokenErrorCodes {
  TOKEN_NOT_FOUND = "TOKEN_NOT_FOUND",
  TOKEN_ALREADY_USED = "TOKEN_ALREADY_USED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_NOT_BELONG_TO_USER = "TOKEN_NOT_BELONG_TO_USER"
}

const TokenErrorMessages = {
  [TokenErrorCodes.TOKEN_NOT_FOUND]: "Token not found. Please check the ID.",
  [TokenErrorCodes.TOKEN_ALREADY_USED]: "This token has already been used.",
  [TokenErrorCodes.TOKEN_EXPIRED]: "This token has expired.",
  [TokenErrorCodes.TOKEN_NOT_BELONG_TO_USER]: "This token does not belong to the user."
} as const;

export { TokenErrorCodes, TokenErrorMessages };
