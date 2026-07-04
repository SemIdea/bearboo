import { TRPCError } from "@trpc/server";
import { ICommentModel } from "@/server/models/comment";
import { CommentErrorCode } from "@/shared/error/comment";
import { UpdateCommentInput } from "../schema";

type Params = UpdateCommentInput & {
  userId: string;
  repositories: {
    database: ICommentModel;
  };
};

const UpdateCommentService = async ({ repositories, ...data }: Params) => {
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
