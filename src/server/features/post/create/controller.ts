import { CreatePostService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { CreatePostInput } from "@/server/schema/post.schema";

const createPostController = async ({
  input,
  ctx
}: {
  input: CreatePostInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const post = await CreatePostService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    },
    userId: ctx.user.id,
    ...input
  });

  return post;
};

export { createPostController };
