import { readAllPostsService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";

const readAllPostsController = async ({ ctx }: { ctx: IAPIContextDTO }) => {
  const posts = await readAllPostsService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    }
  });

  return posts;
};

export { readAllPostsController };
