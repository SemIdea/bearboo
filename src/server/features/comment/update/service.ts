import { TRPCError } from "@trpc/server";
import { IUpdateCommentDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";

const UpdateCommentService = async ({
  repositories,
  ...data
}: IUpdateCommentDTO) => {
  const comment = await CommentEntity.find({
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
    repositories,
    data,
    id: data.id
  });

  return updatedComment;
};

export { UpdateCommentService };
