import { IPostModel } from "@/server/entities/post/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IGetUserPostsDTO = {
  userId: string;
  repositories: IGetUserPostsRepositories;
};

type IGetUserPostsRepositories = {
  database: IPostModel;
  cache: ICacheRepositoryAdapter;
};

export type { IGetUserPostsDTO, IGetUserPostsRepositories };
