import { IAPIContextDTO } from "@/server/createContext";
import { GetUserPostsService } from "./service";

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
