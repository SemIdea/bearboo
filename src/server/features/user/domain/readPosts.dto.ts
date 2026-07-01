import { IPostModel } from "@/server/entities/post/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IGetUserPostsRepositories = {
  database: IPostModel;
  user: IUserModel;
  cache: ICacheRepositoryAdapter;
};

type IGetUserPostsDTO = {
  id: string;
  repositories: IGetUserPostsRepositories;
};

export type { IGetUserPostsDTO, IGetUserPostsRepositories };
