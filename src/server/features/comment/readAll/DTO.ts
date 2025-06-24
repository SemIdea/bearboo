import { ICommentModel } from "@/server/entities/comment/DTO";

type IReadAllCommentsByPostIdDTO = {
  postId: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IReadAllCommentsByPostIdDTO };
