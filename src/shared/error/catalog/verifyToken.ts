import { defineDomainErrors } from "../registry";

const VerifyTokenErrors = defineDomainErrors("verifyToken", {
	not_found: {
		message: "Token not found. Please check the ID.",
		level: "info",
	},
	already_used: {
		message: "This token has already been used.",
		level: "info",
	},
	expired: {
		message: "This token has expired.",
		level: "info",
	},
});

export { VerifyTokenErrors };
