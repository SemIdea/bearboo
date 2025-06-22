import { ICreateCommentDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";

const CreateCommentService = async ({
  repositories,
  ...data
}: ICreateCommentDTO) => {
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
