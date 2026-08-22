import { defineDomainErrors } from "./registry";

const CommentErrors = defineDomainErrors("comment", {
	not_found: {
		httpCode: "NOT_FOUND",
		message: "Comment not found. Please check the ID.",
	},
	delete_forbidden: {
		httpCode: "FORBIDDEN",
		message: "You are not allowed to delete this comment.",
	},
	update_forbidden: {
		httpCode: "FORBIDDEN",
		message: "You are not allowed to update this comment.",
	},
});

export { CommentErrors };
