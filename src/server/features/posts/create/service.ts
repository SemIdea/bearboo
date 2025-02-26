import { TRPCError } from "@trpc/server";
import { ICreatePostDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { AuthErrorCode } from "@/shared/error/auth";

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

  //   const post = PostEnt
};
