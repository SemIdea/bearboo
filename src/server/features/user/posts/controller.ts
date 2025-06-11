import { GetUserPostsService } from "./service";
import { GetUserPostsInput } from "@/server/schema/user.schema";
import { IAPIContextDTO } from "@/server/createContext";

const getUserPostsController = async ({
  input,
  ctx
}: {
  input: GetUserPostsInput;
  ctx: IAPIContextDTO;
}) => {
  const posts = GetUserPostsService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    },
    ...input
  });

  return posts;
};

export { getUserPostsController };
