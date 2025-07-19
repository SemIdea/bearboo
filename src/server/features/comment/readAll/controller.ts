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
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.comment
    },
  });

  return comments;
};

export { readAllCommentsByPostController };
