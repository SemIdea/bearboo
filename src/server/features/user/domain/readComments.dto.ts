import { ICommentModel } from "@/server/entities/comment/DTO";
import { IUserModel } from "@/server/entities/user/DTO";

type IGetUserCommentsDTO = {
  id: string;
  repositories: {
    database: ICommentModel;
    user: IUserModel;
  };
};

export type { IGetUserCommentsDTO };
