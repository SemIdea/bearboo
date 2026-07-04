import { TRPCError } from "@trpc/server";
import { IPostModel } from "@/server/models/post";
import { PostErrorCode } from "@/shared/error/post";
import { ReadPostInput } from "../schema";

type Params = ReadPostInput & {
  repositories: {
    database: IPostModel;
  };
};

const ReadPostService = async ({ repositories, id }: Params) => {
  const post = await repositories.database.read(id);

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  return post;
};

export { ReadPostService };
