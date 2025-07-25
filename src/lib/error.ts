import { UserErrorMessages } from "@/shared/error/user";
import { AuthErrorMessages } from "@/shared/error/auth";
import { CommentErrorMessages } from "@/shared/error/comment";
import { PostErrorMessages } from "@/shared/error/post";
import { TokenErrorMessages } from "@/shared/error/token";
import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "@/server/routers/app.routes";

const extractErrorMessage = (error: TRPCClientErrorLike<AppRouter>): string => {
  const zod = error?.data?.zodError;
  if (zod?.fieldErrors) {
    const firstErrorCode = Object.values(zod.fieldErrors).flat().find(Boolean);
    if (firstErrorCode) return getErrorMessage(firstErrorCode);
  }

  return getErrorMessage(error.message);
};

type AppErrorCode =
  | keyof typeof AuthErrorMessages
  | keyof typeof CommentErrorMessages
  | keyof typeof PostErrorMessages
  | keyof typeof TokenErrorMessages
  | keyof typeof UserErrorMessages;

const getErrorMessage = (code: string | AppErrorCode): string => {
  const allErrorMessages = {
    ...AuthErrorMessages,
    ...CommentErrorMessages,
    ...PostErrorMessages,
    ...TokenErrorMessages,
    ...UserErrorMessages
  };

  return (
    allErrorMessages[code as keyof typeof allErrorMessages] ||
    "An unexpected error occurred. Please try again."
  );
};

export { getErrorMessage, extractErrorMessage };
