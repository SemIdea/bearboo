import { defineDomainErrors } from "../registry";

const CommentErrors = defineDomainErrors("comment", {
	not_found: {
		message: "Comment not found. Please check the ID.",
		level: "info",
	},
	delete_forbidden: {
		message: "You are not allowed to delete this comment.",
	},
	update_forbidden: {
		message: "You are not allowed to update this comment.",
	},
});

export { CommentErrors };
