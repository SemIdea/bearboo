import { defineDomainErrors } from "./registry";

const MediaErrors = defineDomainErrors("media", {
	not_found: {
		message: "Media not found.",
		level: "info",
	},
	delete_forbidden: {
		message: "You are not allowed to delete this media.",
	},
});

export { MediaErrors };
