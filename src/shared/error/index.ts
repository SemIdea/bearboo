import { AuthErrors } from "./auth";
import { CommentErrors } from "./comment";
import { MediaErrors } from "./media";
import { PostErrors } from "./post";
import type { ResolvedErrorEntry } from "./registry";
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

// Resolves an error code to its metadata, applying the defaults once here
// rather than at each call site.
//
// It lives in the aggregate rather than in `registry.ts` because `Errors` is
// the complete, static table: the lookup is total over `ErrorCode` and cannot
// miss. A map filled by `defineDomainErrors` would instead depend on every
// catalog module having been imported first.
const resolveErrorEntry = (code: ErrorCode): ResolvedErrorEntry => {
	const entry = Errors[code];

	return {
		message: entry.message,
		retryable: entry.retryable ?? false,
		level: entry.level ?? "warn",
	};
};

export { type ErrorCode, Errors, resolveErrorEntry };
