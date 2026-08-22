import { defineDomainErrors } from "./registry";

const VerifyTokenErrors = defineDomainErrors("verifyToken", {
	not_found: {
		httpCode: "NOT_FOUND",
		message: "Token not found. Please check the ID.",
		level: "info",
	},
	already_used: {
		httpCode: "BAD_REQUEST",
		message: "This token has already been used.",
		level: "info",
	},
	expired: {
		httpCode: "BAD_REQUEST",
		message: "This token has expired.",
		level: "info",
	},
});

export { VerifyTokenErrors };
