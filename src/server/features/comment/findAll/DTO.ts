import { ICommentModel } from "@/server/entities/comment/DTO";

type IFindAllCommentsByPostIdDTO = {
  postId: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IFindAllCommentsByPostIdDTO };
