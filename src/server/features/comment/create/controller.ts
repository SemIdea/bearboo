import { CreateCommentService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { CreateCommentInput } from "@/server/schema/comment.schema";

const createCommentController = async ({
  input,
  ctx
}: {
  input: CreateCommentInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const comment = await CreateCommentService({
    ...input,
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    },
    helpers: ctx.helpers
  });

  return comment;
};

export { createCommentController };
