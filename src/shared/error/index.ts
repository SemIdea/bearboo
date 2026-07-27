import { AuthErrors } from "./auth";
import { MediaErrors } from "./media";
import { ResetTokenErrors } from "./resetToken";
import { SessionErrors } from "./session";
import { VerifyTokenErrors } from "./verifyToken";

const Errors = {
	...AuthErrors,
	...MediaErrors,
	...ResetTokenErrors,
	...SessionErrors,
	...VerifyTokenErrors,
} as const;

type ErrorCode = keyof typeof Errors;

export { Errors, type ErrorCode };
