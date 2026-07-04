import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { CommentErrorCode } from "@/shared/error/comment";
import { DeleteCommentInput } from "../schema";

type Input = DomainInput<DeleteCommentInput & { userId: string }>;

const DeleteCommentService = async ({ ctx, ...data }: Input) => {
  const comment = await ctx.repositories.comment.read(data.id);

  if (!comment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: CommentErrorCode.COMMENT_NOT_FOUND
    });
  }

  if (comment.userId !== data.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: CommentErrorCode.COMMENT_DELETE_FORBIDDEN
    });
  }

  return await ctx.repositories.comment.delete(data.id);
};

export { DeleteCommentService };
