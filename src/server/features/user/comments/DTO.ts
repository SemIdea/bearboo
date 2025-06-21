import { ICommentModel } from "@/server/entities/comment/DTO";

type IGetUserCommentsDTO = {
  userId: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IGetUserCommentsDTO };
