import { ReadPostService } from "../domain/read";
import { IAPIContextDTO } from "@/server/createContext";
import { ReadPostInput } from "../schema";

const readPostController = async ({
  input,
  ctx
}: {
  input: ReadPostInput;
  ctx: IAPIContextDTO;
}) => {
  const post = await ReadPostService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    }
  });

  return post;
};

export { readPostController };
