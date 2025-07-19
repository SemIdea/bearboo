import { TRPCError } from "@trpc/server";
import { IDeleteCommentDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";
import { CommentErrorCode } from "@/shared/error/comment";

const DeleteCommentService = async ({
  repositories,
  ...data
}: IDeleteCommentDTO) => {
  const comment = await CommentEntity.read({
    ...data,
    repositories: {
      ...repositories
    }
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

  return await CommentEntity.delete({
    ...data,
    repositories: {
      ...repositories
    }
  });
};

export { DeleteCommentService };
