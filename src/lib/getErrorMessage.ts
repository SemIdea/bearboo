import { UserErrorMessages } from "@/shared/error/user";
import { AuthErrorMessages } from "@/shared/error/auth";
import { CommentErrorMessages } from "@/shared/error/comment";
import { PostErrorMessages } from "@/shared/error/post";
import { TokenErrorMessages } from "@/shared/error/token";

export const getErrorMessage = (code: string): string => {
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
