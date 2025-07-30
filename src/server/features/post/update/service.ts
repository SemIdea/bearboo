import { TRPCError } from "@trpc/server";
import { IUpdatePostDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";
import { PostErrorCode } from "@/shared/error/post";

const UpdatePostService = async ({ repositories, ...data }: IUpdatePostDTO) => {
  const post = await PostEntity.read({
    ...data,
    repositories
  });

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

  return await PostEntity.update({
    ...data,
    data,
    repositories
  });
};

export { UpdatePostService };
