import { TRPCError } from "@trpc/server";
import { ICreateCommentDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";

const CreateCommentService = async ({
  repositories,
  ...data
}: ICreateCommentDTO) => {
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

  const commentId = await GenerateSnowflakeUID();

  const comment = await CommentEntity.create({
    id: commentId,
    data,
    repositories: {
      ...repositories
    }
  });

  return comment;
};

export { CreateCommentService };
