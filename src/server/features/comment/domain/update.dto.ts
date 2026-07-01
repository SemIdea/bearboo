import { ICommentModel } from "@/server/entities/comment/DTO";

type IUpdateCommentDTO = {
  id: string;
  userId: string;
  content: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IUpdateCommentDTO };
