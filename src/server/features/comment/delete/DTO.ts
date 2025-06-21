import { ICommentModel } from "@/server/entities/comment/DTO";

type IDeleteCommentDTO = {
  id: string;
  userId: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IDeleteCommentDTO };
