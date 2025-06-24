import { ReadAllCommentsByPostService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";
import { ReadAllCommentsByPostInput } from "@/server/schema/comment.schema";

const readAllCommentsByPostController = async ({
  input,
  ctx
}: {
  input: ReadAllCommentsByPostInput;
  ctx: IAPIContextDTO;
}) => {
  const comments = await ReadAllCommentsByPostService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    },
    ...input
  });

  return comments;
};

export { readAllCommentsByPostController };
