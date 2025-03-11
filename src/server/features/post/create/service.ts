import { TRPCError } from "@trpc/server";
import { ICreatePostDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { AuthErrorCode } from "@/shared/error/auth";
import { PostEntity } from "@/server/entities/post/entity";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";

const CreatePostService = async ({ repositories, ...data }: ICreatePostDTO) => {
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

  const postId = await GenerateSnowflakeUID();

  const post = await PostEntity.create({
    id: postId,
    data: {
      userId: data.userId,
      title: data.title,
      content: data.content,
    },
    repositories: {
      database: repositories.database,
      cache: repositories.cache,
    },
  });

  return post;
};

export { CreatePostService };
