import { DeletePostService } from "./service";
import { IProtectedAPIContextDTO } from "@/server/createContext";
import { DeletePostInput } from "@/server/schema/post.schema";

const deletePostController = async ({
  input,
  ctx
}: {
  input: DeletePostInput;
  ctx: IProtectedAPIContextDTO;
}) => {
  const post = await DeletePostService({
    ...input,
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.post
    }
  });

  console.log("Post deleted successfully:", post);

  return post;
};

export { deletePostController };
