import { defineDomainErrors } from "./registry";

const UserErrors = defineDomainErrors("user", {
	not_found: {
		httpCode: "NOT_FOUND",
		message: "User not found. Please check the email.",
		level: "info",
	},
	already_exists: {
		httpCode: "CONFLICT",
		message: "A user with this email already exists.",
		level: "info",
	},
});

export { UserErrors };
