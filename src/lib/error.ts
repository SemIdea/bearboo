import { AuthErrorMessages } from "@/shared/error/auth";
import { CommentErrorMessages } from "@/shared/error/comment";
import { PostErrorMessages } from "@/shared/error/post";
import { UserErrorMessages } from "@/shared/error/user";
import { ValidationErrorMessages } from "@/shared/error/validation";

type AppErrorCode =
	| keyof typeof AuthErrorMessages
	| keyof typeof CommentErrorMessages
	| keyof typeof PostErrorMessages
	| keyof typeof UserErrorMessages
	| keyof typeof ValidationErrorMessages;

// Two eras of error.message coexist during the ErrorRegistry migration
// (ADR-0017): domains not yet migrated still send the bare legacy code
// (looked up below); migrated domains send the final human text directly
// (already correct, nothing to look up — returned as-is).
const getErrorMessage = (code: string | AppErrorCode): string => {
	const allErrorMessages = {
		...AuthErrorMessages,
		...CommentErrorMessages,
		...PostErrorMessages,
		...UserErrorMessages,
		...ValidationErrorMessages,
	};

	return allErrorMessages[code as keyof typeof allErrorMessages] ?? code;
};

export { getErrorMessage };
