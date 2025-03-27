import { IProtectedAPIContextDTO } from "@/server/createContext";
import { UpdatePostInput } from "@/server/schema/post.schema";
import { UpdatePostService } from "./service";

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
