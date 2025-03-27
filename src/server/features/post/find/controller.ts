import { IProtectedAPIContextDTO } from "@/server/createContext";
import { ReadPostInput } from "@/server/schema/post.schema";
import { ReadPostService } from "./service";

const findPostController = async ({
  input,
  ctx,
}: {
  input: ReadPostInput;
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
