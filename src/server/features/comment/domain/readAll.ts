import { IReadAllCommentsByPostIdDTO } from "./readAll.dto";

const ReadAllCommentsByPostService = async ({
  repositories,
  postId
}: IReadAllCommentsByPostIdDTO) => {
  const comments = await repositories.database.readAllByPostId(postId);

  return comments ?? [];
};

export { ReadAllCommentsByPostService };
