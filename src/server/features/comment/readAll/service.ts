import { IReadAllCommentsByPostIdDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";

const ReadAllCommentsByPostService = async ({
  repositories,
  ...data
}: IReadAllCommentsByPostIdDTO) => {
  const comments = await CommentEntity.readAllByPostId({
    repositories: {
      ...repositories
    },
    ...data
  });

  return comments;
};

export { ReadAllCommentsByPostService };
