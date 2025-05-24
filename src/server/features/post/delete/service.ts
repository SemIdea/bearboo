import { TRPCError } from "@trpc/server";
import { IDeletePostDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { AuthErrorCode } from "@/shared/error/auth";
import { PostEntity } from "@/server/entities/post/entity";

const DeletePostService = async ({ repositories, ...data }: IDeletePostDTO) => {
  const user = await UserEntity.find({
    id: data.userId,
    repositories: {
      ...repositories,
      database: repositories.user,
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
      ...repositories,
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
      ...repositories,
    },
  });
};

export { DeletePostService };
