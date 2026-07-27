import { defineDomainErrors } from "./registry";

enum PostErrorCode {
	POST_NOT_FOUND = "POST_NOT_FOUND",
	POST_UPDATE_FORBIDDEN = "POST_UPDATE_FORBIDDEN",
	POST_DELETE_FORBIDDEN = "POST_DELETE_FORBIDDEN",
	POST_DELETE_FAILED = "POST_DELETE_FAILED",
	POST_INVALID_STATUS_TRANSITION = "POST_INVALID_STATUS_TRANSITION",
}

const PostErrorMessages = {
	[PostErrorCode.POST_NOT_FOUND]: "Post not found.",
	[PostErrorCode.POST_UPDATE_FORBIDDEN]:
		"You are not allowed to update this post.",
	[PostErrorCode.POST_DELETE_FORBIDDEN]:
		"You are not allowed to delete this post.",
	[PostErrorCode.POST_DELETE_FAILED]:
		"Failed to delete the post. Please try again.",
	[PostErrorCode.POST_INVALID_STATUS_TRANSITION]:
		"This action is not valid for the post's current status.",
} as const;

const PostErrors = defineDomainErrors("post", {
	not_found: {
		httpCode: "NOT_FOUND",
		message: PostErrorMessages[PostErrorCode.POST_NOT_FOUND],
	},
	update_forbidden: {
		httpCode: "FORBIDDEN",
		message: PostErrorMessages[PostErrorCode.POST_UPDATE_FORBIDDEN],
	},
	delete_forbidden: {
		httpCode: "FORBIDDEN",
		message: PostErrorMessages[PostErrorCode.POST_DELETE_FORBIDDEN],
	},
	invalid_status_transition: {
		httpCode: "BAD_REQUEST",
		message: PostErrorMessages[PostErrorCode.POST_INVALID_STATUS_TRANSITION],
	},
});

export { PostErrorCode, PostErrorMessages, PostErrors };
