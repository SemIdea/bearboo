import { CreatePostService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { CreatePostInput } from "@/server/schema/post.schema";

const createPostController = async ({
  input,
  ctx,
}: {
  input: CreatePostInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const post = await CreatePostService({
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post,
    },
    ...input,
  });

  return post;
};

export { createPostController };
