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
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post,
    },
    ...input
  });

  return post;
};

export { findPostController };
