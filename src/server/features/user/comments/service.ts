import { UserEntity } from "@/server/entities/user/entity";
import { IGetUserCommentsDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";

const ReadUserCommentsService = async ({
  repositories,
  ...data
}: IGetUserCommentsDTO) => {
  const user = await UserEntity.read({
    id: data.id,
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

  const comments = await CommentEntity.readAllByUserId({
    userId: data.id,
    repositories
  });

  return comments;
};

export { ReadUserCommentsService };
