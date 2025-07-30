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
    ...input,
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    }
  });

  return comment;
};

export { deleteCommentController };
