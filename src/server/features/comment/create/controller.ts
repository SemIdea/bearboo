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
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    },
    userId: ctx.user.id,
    ...input
  });

  return comment;
};

export { createCommentController };
