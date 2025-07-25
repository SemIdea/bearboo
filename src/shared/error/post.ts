enum PostErrorCode {
  POST_NOT_FOUND = "POST_NOT_FOUND",
  POST_UPDATE_FORBIDDEN = "POST_UPDATE_FORBIDDEN",
  POST_DELETE_FORBIDDEN = "POST_DELETE_FORBIDDEN", 
  POST_DELETE_FAILED = "POST_DELETE_FAILED",
  // Validation errors
  POST_TITLE_REQUIRED = "POST_TITLE_REQUIRED",
  POST_CONTENT_REQUIRED = "POST_CONTENT_REQUIRED",
  POST_TITLE_TOO_SHORT = "POST_TITLE_TOO_SHORT",
  POST_CONTENT_TOO_SHORT = "POST_CONTENT_TOO_SHORT"
}

const PostErrorMessages = {
  [PostErrorCode.POST_NOT_FOUND]: "Post not found. Please check the ID.",
  [PostErrorCode.POST_UPDATE_FORBIDDEN]:
    "You are not allowed to update this post.",
  [PostErrorCode.POST_DELETE_FORBIDDEN]:
    "You are not allowed to delete this post.",
  [PostErrorCode.POST_DELETE_FAILED]:
    "Failed to delete the post. Please try again.",
  [PostErrorCode.POST_TITLE_REQUIRED]: "Post title is required.",
  [PostErrorCode.POST_CONTENT_REQUIRED]: "Post content is required.", 
  [PostErrorCode.POST_TITLE_TOO_SHORT]: "Post title must be at least 3 characters long.",
  [PostErrorCode.POST_CONTENT_TOO_SHORT]: "Post content must be at least 10 characters long."
} as const;

export { PostErrorCode, PostErrorMessages };
