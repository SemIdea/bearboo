import { defineDomainErrors } from "./registry";

const ResetTokenErrors = defineDomainErrors("resetToken", {
	not_found: {
		httpCode: "NOT_FOUND",
		message: "Reset token not found. Please check the ID.",
		level: "info",
	},
	already_used: {
		httpCode: "FORBIDDEN",
		message: "This reset token has already been used.",
		level: "info",
	},
	expired: {
		httpCode: "FORBIDDEN",
		message: "This reset token has expired.",
		level: "info",
	},
});

export { ResetTokenErrors };
