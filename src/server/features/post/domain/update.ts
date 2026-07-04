import { TRPCError } from "@trpc/server";
import { IUpdatePostDTO } from "./update.dto";
import { PostErrorCode } from "@/shared/error/post";

const UpdatePostService = async ({ repositories, ...data }: IUpdatePostDTO) => {
  const post = await repositories.database.read(data.id);

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  if (post.userId !== data.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: PostErrorCode.POST_UPDATE_FORBIDDEN
    });
  }

  return await repositories.database.update(data.id, {
    title: data.title,
    content: data.content
  });
};

export { UpdatePostService };
