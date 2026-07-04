import { TRPCError } from "@trpc/server";
import { createDomain, DomainInput } from "@/server/createDomain";
import { CommentErrorCode } from "@/shared/error/comment";
import { DeleteCommentInput } from "../schema";

const domain_deleteComment = createDomain(
  async ({
    ctx,
    input
  }: DomainInput<DeleteCommentInput & { userId: string }>) => {
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
        message: CommentErrorCode.COMMENT_DELETE_FORBIDDEN
      });
    }

    return ctx.repositories.comment.delete(input.id);
  }
);

export { domain_deleteComment };
