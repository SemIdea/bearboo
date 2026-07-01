import { UpdateCommentService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { UpdateCommentInput } from "@/server/schema/comment.schema";

const updateCommentController = async ({
  input,
  ctx
}: {
  input: UpdateCommentInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const comment = await UpdateCommentService({
    ...input,
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    }
  });

  return comment;
};

export { updateCommentController };
