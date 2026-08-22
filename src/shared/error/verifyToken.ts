import { defineDomainErrors } from "./registry";

const VerifyTokenErrors = defineDomainErrors("verifyToken", {
	not_found: {
		httpCode: "NOT_FOUND",
		message: "Token not found. Please check the ID.",
	},
	already_used: {
		httpCode: "BAD_REQUEST",
		message: "This token has already been used.",
	},
	expired: {
		httpCode: "BAD_REQUEST",
		message: "This token has expired.",
	},
});

export { VerifyTokenErrors };
