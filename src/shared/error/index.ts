import { AuthErrors } from "./auth";
import { MediaErrors } from "./media";
import { ResetTokenErrors } from "./resetToken";
import { SessionErrors } from "./session";
import { UserErrors } from "./user";
import { VerifyTokenErrors } from "./verifyToken";

const Errors = {
	...AuthErrors,
	...MediaErrors,
	...ResetTokenErrors,
	...SessionErrors,
	...UserErrors,
	...VerifyTokenErrors,
} as const;

type ErrorCode = keyof typeof Errors;

export { Errors, type ErrorCode };
