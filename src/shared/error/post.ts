enum PostErrorCode {
  POST_NOT_FOUND = "POST_NOT_FOUND",
  POST_UPDATE_FORBIDDEN = "POST_UPDATE_FORBIDDEN",
  POST_DELETE_FORBIDDEN = "POST_DELETE_FORBIDDEN",
  POST_DELETE_FAILED = "POST_DELETE_FAILED",
}

const PostErrorMessages = {
  [PostErrorCode.POST_NOT_FOUND]: "Post not found. Please check the ID.",
  [PostErrorCode.POST_UPDATE_FORBIDDEN]: "You are not allowed to update this post.",
  [PostErrorCode.POST_DELETE_FORBIDDEN]: "You are not allowed to delete this post.",
  [PostErrorCode.POST_DELETE_FAILED]: "Failed to delete the post. Please try again."
} as const;

export { PostErrorCode, PostErrorMessages };
