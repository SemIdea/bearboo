import { IEntityDatabaseRepository } from "../base/entity";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IPostEntity = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type IPostExtraRepositories = {
  readRecents: (count: number) => Promise<IPostEntity[]>;
  readUserPosts: (userId: string) => Promise<IPostEntity[]>;
};

type IPostModel = IEntityDatabaseRepository<
  IPostEntity,
  IPostExtraRepositories
>;

type IReadAllPostsDTO = {
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IReadUserPostsDTO = {
  userId: string;
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type { IPostEntity, IPostModel, IReadAllPostsDTO, IReadUserPostsDTO };
