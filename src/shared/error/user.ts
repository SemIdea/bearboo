import { defineDomainErrors } from "./registry";

const UserErrors = defineDomainErrors("user", {
	not_found: {
		message: "User not found. Please check the email.",
		level: "info",
	},
	already_exists: {
		message: "A user with this email already exists.",
		level: "info",
	},
});

export { UserErrors };
