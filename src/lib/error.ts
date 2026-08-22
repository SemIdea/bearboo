import { ValidationErrorMessages } from "@/shared/error/validation";

type AppErrorCode = keyof typeof ValidationErrorMessages;

const getErrorMessage = (code: string | AppErrorCode): string =>
	ValidationErrorMessages[code as keyof typeof ValidationErrorMessages] ?? code;

export { getErrorMessage };
