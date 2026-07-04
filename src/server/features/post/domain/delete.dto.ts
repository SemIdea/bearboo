import { IPostModel } from "@/server/models/post";
import { IUserModel } from "@/server/models/user";

type IDeletePostDTO = {
  id: string;
  userId: string;
  repositories: {
    user: IUserModel;
    database: IPostModel;
  };
};

export type { IDeletePostDTO };
