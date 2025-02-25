import { IAPIContextDTO } from "@/server/createContext";
import { CreatePostInput } from "@/server/schema/post.schema";

const createPostController = async ({
  input,
  ctx,
}: {
  input: CreatePostInput;
  ctx: IAPIContextDTO;
}) => {
    // const post = await CreatePostService({})
};
