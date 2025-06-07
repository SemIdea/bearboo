import { TRPCError } from "@trpc/server";
import { IGetUserPostsDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { PostEntity } from "@/server/entities/post/entity";
import { AuthErrorCode } from "@/shared/error/auth";

const GetUserPostsService = async ({
  repositories,
  ...data
}: IGetUserPostsDTO) => {
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

  const posts = await PostEntity.findUserPosts({
    userId: data.userId,
    repositories,
  });

  return posts;
};

export { GetUserPostsService };
