import { IGetUserCommentsDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";

const ReadUserCommentsService = async ({
  repositories,
  ...data
}: IGetUserCommentsDTO) => {
  const comments = await CommentEntity.readAllByUserId({
    userId: data.id,
    repositories
  });

  return comments;
};

export { ReadUserCommentsService };
