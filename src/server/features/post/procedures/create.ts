import { CreatePostService } from "../domain/create";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { CreatePostInput } from "../schema";

const createPostController = async ({
  input,
  ctx
}: {
  input: CreatePostInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const post = await CreatePostService({
    ...input,
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    },
    helpers: ctx.helpers
  });

  return post;
};

export { createPostController };
