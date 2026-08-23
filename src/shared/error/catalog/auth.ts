import { defineDomainErrors } from "../registry";

const AuthErrors = defineDomainErrors("auth", {
	invalid_credentials: {
		message: "Invalid email or password. Please try again.",
	},
	user_not_verified: {
		message: "Your account is not verified. Please check your email.",
		level: "info",
	},
	user_not_logged_in: {
		message: "You are not logged in. Please log in to continue.",
		level: "info",
	},
	too_many_attempts: {
		message: "Too many attempts. Please try again later.",
		retryable: true,
	},
	insufficient_role: {
		message: "You do not have permission to perform this action.",
	},
});

export { AuthErrors };
