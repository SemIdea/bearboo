import { TRPCError } from "@trpc/server";
import { IUpdateCommentDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";
import { CommentErrorCode } from "@/shared/error/comment";

const UpdateCommentService = async ({
  repositories,
  ...data
}: IUpdateCommentDTO) => {
  const comment = await CommentEntity.read({
    ...data,
    repositories
  });

  if (!comment) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: CommentErrorCode.COMMENT_NOT_FOUND
    });
  }

  if (comment.userId !== data.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: CommentErrorCode.COMMENT_NOT_BELONG_TO_USER
    });
  }

  const updatedComment = await CommentEntity.update({
    ...data,
    data,
    repositories
  });

  return updatedComment;
};

export { UpdateCommentService };
