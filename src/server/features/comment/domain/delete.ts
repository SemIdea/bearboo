import { TRPCError } from "@trpc/server";
import { IDeleteCommentDTO } from "./delete.dto";
import { CommentErrorCode } from "@/shared/error/comment";

const DeleteCommentService = async ({
  repositories,
  ...data
}: IDeleteCommentDTO) => {
  const comment = await repositories.database.read(data.id);

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

  return await repositories.database.delete(data.id);
};

export { DeleteCommentService };
