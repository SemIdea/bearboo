import { TRPCError } from "@trpc/server";
import { IUpdatePostDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { PostEntity } from "@/server/entities/post/entity";
import { UserErrorCode } from "@/shared/error/user";
import { PostErrorCode } from "@/shared/error/post";

const UpdatePostService = async ({ repositories, ...data }: IUpdatePostDTO) => {
  const user = await UserEntity.find({
    id: data.userId,
    repositories: {
      ...repositories,
      database: repositories.user
    }
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUD
    });
  }

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

  // Fix Error Message
  if (post.userId !== user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can't update this post"
    });
  }

  return await PostEntity.update({
    id: data.postId,
    data: {
      title: data.title,
      content: data.content
    },
    repositories
  });
};

export { UpdatePostService };
