import { IProtectedAPIContextDTO } from "@/server/createContext";
import { CreatePostInput } from "@/server/schema/post.schema";
import { CreatePostService } from "./service";

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
