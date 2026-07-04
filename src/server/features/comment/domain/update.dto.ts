import { ICommentModel } from "@/server/models/comment";

type IUpdateCommentDTO = {
  id: string;
  userId: string;
  content: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IUpdateCommentDTO };
