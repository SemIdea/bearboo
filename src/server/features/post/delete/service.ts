import { TRPCError } from "@trpc/server";
import { IDeletePostDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";
import { PostErrorCode } from "@/shared/error/post";

const DeletePostService = async ({ repositories, ...data }: IDeletePostDTO) => {
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
      message: PostErrorCode.POST_DELETE_FORBIDDEN
    });
  }

  const deletedPost = await PostEntity.delete({
    id: post.id,
    data: post,
    repositories
  });

  return deletedPost;
};

export { DeletePostService };
