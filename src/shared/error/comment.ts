enum CommentErrorCode {
  COMMENT_NOT_FOUND = "COMMENT_NOT_FOUND",
  COMMENT_DELETE_FORBIDDEN = "COMMENT_DELETE_FORBIDDEN",
  COMMENT_UPDATE_FORBIDDEN = "COMMENT_UPDATE_FORBIDDEN"
}

const CommentErrorMessages = {
  [CommentErrorCode.COMMENT_NOT_FOUND]:
    "Comment not found. Please check the ID.",
  [CommentErrorCode.COMMENT_DELETE_FORBIDDEN]:
    "You are not allowed to delete this comment.",
  [CommentErrorCode.COMMENT_UPDATE_FORBIDDEN]:
    "You are not allowed to update this comment."
} as const;

export { CommentErrorCode, CommentErrorMessages };
