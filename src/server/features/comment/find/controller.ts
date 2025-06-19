import { FindAllCommentsByPostService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";
import { FindAllCommentsByPostInput } from "@/server/schema/comment.schema";

const findAllCommentsByPostController = async ({
  input,
  ctx
}: {
  input: FindAllCommentsByPostInput;
  ctx: IAPIContextDTO;
}) => {
  const comments = await FindAllCommentsByPostService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    },
    ...input
  });

  return comments;
};

export { findAllCommentsByPostController };
