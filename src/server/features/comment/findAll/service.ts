import { IFindAllCommentsByPostIdDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";

const FindAllCommentsByPostService = async ({
  repositories,
  ...data
}: IFindAllCommentsByPostIdDTO) => {
  const comments = await CommentEntity.findAllByPostId({
    repositories: {
      ...repositories
    },
    ...data
  });

  return comments;
};

export { FindAllCommentsByPostService };
