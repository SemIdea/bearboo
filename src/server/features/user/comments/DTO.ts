import { ICommentModel } from "@/server/entities/comment/DTO";

type IGetUserCommentsDTO = {
  id: string;
  repositories: {
    database: ICommentModel;
  };
};

export type { IGetUserCommentsDTO };
