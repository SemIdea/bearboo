import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { CommentErrorCode } from "@/shared/error/comment";
import { UpdateCommentInput } from "../schema";

const domain_updateComment = async ({
  ctx,
  input
}: DomainInput<UpdateCommentInput & { userId: string }>) => {
  const comment = await ctx.repositories.comment.read(input.id);

  if (!comment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: CommentErrorCode.COMMENT_NOT_FOUND
    });
  }

  if (comment.userId !== input.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: CommentErrorCode.COMMENT_UPDATE_FORBIDDEN
    });
  }

  return ctx.repositories.comment.update(input.id, {
    content: input.content
  });
};

export { domain_updateComment };
