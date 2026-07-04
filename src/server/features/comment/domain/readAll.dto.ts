import { ICommentModel } from "@/server/models/comment";

type IReadAllCommentsByPostIdDTO = {
  postId: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IReadAllCommentsByPostIdDTO };
