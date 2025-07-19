import { ReadPostService } from "./service";
import { IAPIContextDTO } from "@/server/createContext";
import { ReadPostInput } from "@/server/schema/post.schema";

const readPostController = async ({
  input,
  ctx
}: {
  input: ReadPostInput;
  ctx: IAPIContextDTO;
}) => {
  const post = await ReadPostService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    },
    ...input
  });

  return post;
};

export { readPostController };
