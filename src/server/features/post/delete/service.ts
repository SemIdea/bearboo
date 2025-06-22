import { TRPCError } from "@trpc/server";
import { IDeletePostDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";
import { PostErrorCode } from "@/shared/error/post";

const DeletePostService = async ({ repositories, ...data }: IDeletePostDTO) => {
  const post = await PostEntity.find({
    id: data.postId,
    repositories: {
      ...repositories
    }
  });

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  if (post.userId !== user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can't delete this post"
    });
  }

  await PostEntity.delete({
    id: data.postId,
    repositories: {
      ...repositories
    }
  });
};

export { DeletePostService };
