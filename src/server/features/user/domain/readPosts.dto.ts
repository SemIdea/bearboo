import { IPostModel } from "@/server/models/post";
import { IUserModel } from "@/server/models/user";

type IGetUserPostsRepositories = {
  database: IPostModel;
  user: IUserModel;
};

type IGetUserPostsDTO = {
  id: string;
  repositories: IGetUserPostsRepositories;
};

export type { IGetUserPostsDTO, IGetUserPostsRepositories };
