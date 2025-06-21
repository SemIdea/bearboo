import { IGetUserCommentsDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";

const GetUserCommentsService = async ({
  repositories,
  ...data
}: IGetUserCommentsDTO) => {
  const comments = await CommentEntity.findAllByUserId({
    ...data,
    repositories
  });

  return comments;
};

export { GetUserCommentsService };
