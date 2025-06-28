import { ReadRecentPostsService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";

const readRecentPostsController = async ({ ctx }: { ctx: IAPIContextDTO }) => {
  const posts = await ReadRecentPostsService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    }
  });

  return posts;
};

export { readRecentPostsController };
