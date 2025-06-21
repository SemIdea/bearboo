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
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    },
    ...input,
    userId: ctx.user.id
  });

  return comment;
};

export { updateCommentController };
