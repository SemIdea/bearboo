import { defineDomainErrors } from "../registry";

const ResetTokenErrors = defineDomainErrors("resetToken", {
	not_found: {
		message: "Reset token not found. Please check the ID.",
		level: "info",
	},
	already_used: {
		message: "This reset token has already been used.",
		level: "info",
	},
	expired: {
		message: "This reset token has expired.",
		level: "info",
	},
});

export { ResetTokenErrors };
