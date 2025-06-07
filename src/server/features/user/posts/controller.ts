import { GetUserPostsService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";

const getUserPostsController = async ({
  input,
  ctx,
}: {
  input: any;
  ctx: IAPIContextDTO;
}) => {
  const posts = GetUserPostsService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post,
    },
    ...input,
  });

  return posts;
};

export { getUserPostsController };
