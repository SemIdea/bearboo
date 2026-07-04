import { ICommentModel } from "@/server/models/comment";

type IDeleteCommentDTO = {
  id: string;
  userId: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IDeleteCommentDTO };
