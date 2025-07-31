import { UserErrorMessages } from "@/shared/error/user";
import { AuthErrorMessages } from "@/shared/error/auth";
import { CommentErrorMessages } from "@/shared/error/comment";
import { PostErrorMessages } from "@/shared/error/post";
import { VeriifyTokenErrorMessages } from "@/shared/error/verifyToken";
import { ValidationErrorMessages } from "@/shared/error/validation";

type AppErrorCode =
  | keyof typeof AuthErrorMessages
  | keyof typeof CommentErrorMessages
  | keyof typeof PostErrorMessages
  | keyof typeof VeriifyTokenErrorMessages
  | keyof typeof UserErrorMessages
  | keyof typeof ValidationErrorMessages;

const getErrorMessage = (code: string | AppErrorCode): string => {
  const allErrorMessages = {
    ...AuthErrorMessages,
    ...CommentErrorMessages,
    ...PostErrorMessages,
    ...VeriifyTokenErrorMessages,
    ...UserErrorMessages,
    ...ValidationErrorMessages
  };

  return (
    allErrorMessages[code as keyof typeof allErrorMessages] ||
    "An unexpected error occurred. Please try again."
  );
};

export { getErrorMessage };
