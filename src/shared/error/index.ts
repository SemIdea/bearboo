import { MediaErrors } from "./media";

const Errors = {
	...MediaErrors,
} as const;

type ErrorCode = keyof typeof Errors;

export { Errors, type ErrorCode };
