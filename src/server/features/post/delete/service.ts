import { UserEntity } from "@/server/entities/user/entity";
import { IDeletePostDTO } from "./DTO";
import { TRPCError } from "@trpc/server";
import { AuthErrorCode } from "@/shared/error/auth";
import { PostEntity } from "@/server/entities/post/entity";

const DeletePostService = async ({ repositories, ...data }: IDeletePostDTO) => {
  const user = await UserEntity.find({
    id: data.userId,
    repositories: {
      database: repositories.user,
      cache: repositories.cache,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: AuthErrorCode.USER_NOT_FOUD,
    });
  }

  const post = await PostEntity.find({
    id: data.postId,
    repositories: {
      database: repositories.database,
    },
  });

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Post not found",
    });
  }

  if (post.userId !== user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can't delete this post",
    });
  }

  await PostEntity.delete({
    id: data.postId,
    repositories: {
      database: repositories.database,
    },
  });
};

export { DeletePostService };
