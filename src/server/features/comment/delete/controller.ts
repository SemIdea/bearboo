import { DeleteCommentService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { DeleteCommentInput } from "@/server/schema/comment.schema";

const deleteCommentController = async ({
  input,
  ctx
}: {
  input: DeleteCommentInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const comment = await DeleteCommentService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    },
    userId: ctx.user.id,
    ...input
  });

  return comment;
};

export { deleteCommentController };
