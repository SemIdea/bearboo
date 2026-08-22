import { defineDomainErrors } from "./registry";

const AuthErrors = defineDomainErrors("auth", {
	invalid_credentials: {
		httpCode: "UNAUTHORIZED",
		message: "Invalid email or password. Please try again.",
	},
	user_not_verified: {
		httpCode: "FORBIDDEN",
		message: "Your account is not verified. Please check your email.",
		level: "info",
	},
	user_not_logged_in: {
		httpCode: "UNAUTHORIZED",
		message: "You are not logged in. Please log in to continue.",
		level: "info",
	},
	too_many_attempts: {
		httpCode: "TOO_MANY_REQUESTS",
		message: "Too many attempts. Please try again later.",
		retryable: true,
	},
	insufficient_role: {
		httpCode: "FORBIDDEN",
		message: "You do not have permission to perform this action.",
	},
});

export { AuthErrors };
