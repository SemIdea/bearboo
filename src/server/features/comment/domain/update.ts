import { TRPCError } from "@trpc/server";
import { IUpdateCommentDTO } from "./update.dto";
import { CommentErrorCode } from "@/shared/error/comment";

const UpdateCommentService = async ({
  repositories,
  ...data
}: IUpdateCommentDTO) => {
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
      message: CommentErrorCode.COMMENT_UPDATE_FORBIDDEN
    });
  }

  const updatedComment = await repositories.database.update(data.id, {
    content: data.content
  });

  return updatedComment;
};

export { UpdateCommentService };
