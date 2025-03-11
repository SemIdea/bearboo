import { IAPIContextDTO } from "@/server/createContext";
import { CreatePostInput } from "@/server/schema/post.schema";
import { CreatePostService } from "./service";

const createPostController = async ({
  input,
  ctx,
}: {
  input: CreatePostInput;
  ctx: IAPIContextDTO;
}) => {
  if (!ctx.user || !ctx.user.id) {
    throw new Error("Unauthorized");
  }

  const post = await CreatePostService({
    userId: ctx.user.id,
    repositories: {
      user: ctx.repositories.user,
      database: ctx.repositories.post,
      cache: ctx.repositories.cache,
    },
    ...input,
  });

  return post;
};
