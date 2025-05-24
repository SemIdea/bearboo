import { ReadPostService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { FindPostInput } from "@/server/schema/post.schema";

const findPostController = async ({
  input,
  ctx,
}: {
  input: FindPostInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const post = await ReadPostService({
    postId: input.postId,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post,
    },
  });

  return post;
};

export { findPostController };
