enum CommentErrorCode {
  COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND",
  COMMENT_NOT_BELONG_TO_USER = "COMMENT_NOT_BELONG_TO_USER"
}

const CommentErrorMessages = {
  [CommentErrorCode.COMMENT_NOT_FOUND]: "Comment not found. Please check the ID.",
  [CommentErrorCode.COMMENT_NOT_BELONG_TO_USER]: "This comment does not belong to the user."
} as const;

export { CommentErrorCode, CommentErrorMessages };
