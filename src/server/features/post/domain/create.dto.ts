import { IPostModel } from "@/server/models/post";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";

type ICreatePostDTO = {
  userId: string;
  title: string;
  content: string;
  repositories: {
    user: IUserModel;
    database: IPostModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { ICreatePostDTO };
