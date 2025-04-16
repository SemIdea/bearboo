import { UpdatePostService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { UpdatePostInput } from "@/server/schema/post.schema";

const updatePostController = async ({
  input,
  ctx,
}: {
  input: UpdatePostInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const post = await UpdatePostService({
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post,
    },
    ...input,
  });

  return post;
};

export { updatePostController };
