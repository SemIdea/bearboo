import { UpdatePostService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { UpdatePostInput } from "@/server/schema/post.schema";

const updatePostController = async ({
  input,
  ctx
}: {
  input: UpdatePostInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const post = await UpdatePostService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    },
    userId: ctx.user.id,
    ...input
  });

  return post;
};

export { updatePostController };
