import { ReadAllCommentsByPostService } from "../domain/readAll";
import { IAPIContextDTO } from "@/server/createContext";
import { ReadAllCommentsByPostInput } from "../schema";

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
