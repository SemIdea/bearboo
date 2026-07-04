import { TRPCError } from "@trpc/server";
import { IReadPostDTO } from "./read.dto";
import { PostErrorCode } from "@/shared/error/post";

const ReadPostService = async ({ repositories, id }: IReadPostDTO) => {
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
