import { IPostModel } from "@/server/entities/post/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IGetUserPostsDTO = {
  id: string;
  repositories: IGetUserPostsRepositories;
};

type IGetUserPostsRepositories = {
  database: IPostModel;
  user: IUserModel;
  cache: ICacheRepositoryAdapter;
};

export type { IGetUserPostsDTO, IGetUserPostsRepositories };
