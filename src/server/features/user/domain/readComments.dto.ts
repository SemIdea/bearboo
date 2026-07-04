import { ICommentModel } from "@/server/models/comment";
import { IUserModel } from "@/server/models/user";

type IGetUserCommentsDTO = {
  id: string;
  repositories: {
    database: ICommentModel;
    user: IUserModel;
  };
};

export type { IGetUserCommentsDTO };
