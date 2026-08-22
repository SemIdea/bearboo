import { AuthErrors } from "./auth";
import { CommentErrors } from "./comment";
import { MediaErrors } from "./media";
import { PostErrors } from "./post";
import { ResetTokenErrors } from "./resetToken";
import { SessionErrors } from "./session";
import { UserErrors } from "./user";
import { VerifyTokenErrors } from "./verifyToken";

const Errors = {
	...AuthErrors,
	...CommentErrors,
	...MediaErrors,
	...PostErrors,
	...ResetTokenErrors,
	...SessionErrors,
	...UserErrors,
	...VerifyTokenErrors,
} as const;

type ErrorCode = keyof typeof Errors;

export { type ErrorCode, Errors };
