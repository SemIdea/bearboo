import { IPostModel } from "@/server/models/post";
import { IUserModel } from "@/server/models/user";

type IUpdatePostDTO = {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  repositories: {
    user: IUserModel;
    database: IPostModel;
  };
};

export type { IUpdatePostDTO };
