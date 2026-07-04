import { TRPCError } from "@trpc/server";
import { ICommentModel } from "@/server/models/comment";
import { CommentErrorCode } from "@/shared/error/comment";
import { DeleteCommentInput } from "../schema";

type Params = DeleteCommentInput & {
  userId: string;
  repositories: {
    database: ICommentModel;
  };
};

const DeleteCommentService = async ({ repositories, ...data }: Params) => {
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
