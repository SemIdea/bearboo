import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { CommentErrorCode } from "@/shared/error/comment";
import { UpdateCommentInput } from "../schema";

type Input = DomainInput<UpdateCommentInput & { userId: string }>;

const UpdateCommentService = async ({ ctx, ...data }: Input) => {
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
      message: CommentErrorCode.COMMENT_UPDATE_FORBIDDEN
    });
  }

  const updatedComment = await ctx.repositories.comment.update(data.id, {
    content: data.content
  });

  return updatedComment;
};

export { UpdateCommentService };
