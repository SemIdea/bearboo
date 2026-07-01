import { RevalidatePostService } from "../domain/revalidate";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { RevalidatePostInput } from "../schema";

const revalidatePostController = async ({
  input,
  ctx
}: {
  input: RevalidatePostInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const revalidated = await RevalidatePostService({
    ...input,
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post,
      cache: ctx.repositories.cache
    }
  });

  return revalidated;
};

export { revalidatePostController };
