import { GetUserPostsService } from "../domain/readPosts";
import { ReadUserPostsInput } from "../schema";
import { IAPIContextDTO } from "@/server/createContext";

const readUserPostsController = async ({
  input,
  ctx
}: {
  input: ReadUserPostsInput;
  ctx: IAPIContextDTO;
}) => {
  const posts = GetUserPostsService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    }
  });

  return posts;
};

export { readUserPostsController };
