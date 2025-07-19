import { IReadAllCommentsByPostIdDTO } from "./DTO";
import { CommentEntity } from "@/server/entities/comment/entity";

const ReadAllCommentsByPostService = async ({
  repositories,
  ...data
}: IReadAllCommentsByPostIdDTO) => {
  const comments = await CommentEntity.readAllByPostId({
    ...data,
    repositories
  });

  return comments;
};

export { ReadAllCommentsByPostService };
