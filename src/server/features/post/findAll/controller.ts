import { IAPIContextDTO } from "@/server/createContext";
import { FindAllPostsService } from "./service";

const findAllPostsController = async ({ ctx }: { ctx: IAPIContextDTO }) => {
  const posts = await FindAllPostsService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post,
    },
  });

  return posts;
};

export { findAllPostsController };
