import { AuthErrors } from "./auth";
import { MediaErrors } from "./media";
import { SessionErrors } from "./session";

const Errors = {
	...AuthErrors,
	...MediaErrors,
	...SessionErrors,
} as const;

type ErrorCode = keyof typeof Errors;

export { Errors, type ErrorCode };
