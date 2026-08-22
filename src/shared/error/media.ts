import { defineDomainErrors } from "./registry";

const MediaErrors = defineDomainErrors("media", {
	not_found: {
		httpCode: "NOT_FOUND",
		message: "Media not found.",
		level: "info",
	},
	delete_forbidden: {
		httpCode: "FORBIDDEN",
		message: "You are not allowed to delete this media.",
	},
});

export { MediaErrors };
