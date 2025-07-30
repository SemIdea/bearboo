enum CommentErrorCode {
  COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND",
  COMMENT_DELETE_FORBIDDEN = "COMMENT_DELETE_FORBIDDEN",
  COMMENT_UPDATE_FORBIDDEN = "COMMENT_UPDATE_FORBIDDEN",
  // Validation errors
  COMMENT_CONTENT_REQUIRED = "COMMENT_CONTENT_REQUIRED",
  COMMENT_CONTENT_TOO_SHORT = "COMMENT_CONTENT_TOO_SHORT"
}

const CommentErrorMessages = {
  [CommentErrorCode.COMMENT_NOT_FOUND]:
    "Comment not found. Please check the ID.",
  [CommentErrorCode.COMMENT_DELETE_FORBIDDEN]:
    "You are not allowed to delete this comment.",
  [CommentErrorCode.COMMENT_UPDATE_FORBIDDEN]:
    "You are not allowed to update this comment.",
  [CommentErrorCode.COMMENT_CONTENT_REQUIRED]: "Comment content is required.",
  [CommentErrorCode.COMMENT_CONTENT_TOO_SHORT]:
    "Comment must be at least 1 character long."
} as const;

export { CommentErrorCode, CommentErrorMessages };
