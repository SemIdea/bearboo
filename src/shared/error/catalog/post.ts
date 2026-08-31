import { defineDomainErrors } from "../registry";

const PostErrors = defineDomainErrors("post", {
	not_found: {
		message: "Post not found.",
		level: "info",
	},
	update_forbidden: {
		message: "You are not allowed to update this post.",
	},
	delete_forbidden: {
		message: "You are not allowed to delete this post.",
	},
	invalid_status_transition: {
		message: "This action is not valid for the post's current status.",
		level: "info",
	},
});

export { PostErrors };
