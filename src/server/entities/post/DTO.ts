import {
  CreateDTO,
  DeleteDTO,
  FindDTO,
  UpdateDTO,
  WithRepositories
} from "../base/DTO";
import { IBaseModel } from "../base/model";
import { PostEntity } from "./entity";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IPostEntity = {
  userId: string;
  title: string;
  content: string;
};

type IPostModel = IBaseModel<PostEntity, "id"> & {
  findAll: () => Promise<PostEntity[]>;
  findUserPosts: (userId: string) => Promise<PostEntity[]>;
};

type ICachePostDTO = {
  post: PostEntity;
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type ICacheUserPostsDTO = {
  userId: string;
  posts: PostEntity[];
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type IResolvePostFromIndexDTO = {
  indexKey: string;
  indexKeyCaller: (key: string) => string;
  findOnDatabase: (id: string) => Promise<PostEntity | null>;
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type ICreatePostDTO = CreateDTO<
  IPostEntity,
  {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  }
>;

type IFindPostDTO = FindDTO<{
  database: IPostModel;
  cache: ICacheRepositoryAdapter;
}>;

type IFindAllPostsDTO = WithRepositories<{
  database: IPostModel;
  cache: ICacheRepositoryAdapter;
}>;

type IFindUserPostsDTO = {
  userId: string;
} & WithRepositories<{
  database: IPostModel;
  cache: ICacheRepositoryAdapter;
}>;

type IUpdatePostDTO = UpdateDTO<
  IPostEntity,
  {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  }
>;

type IDeletePostDTO = DeleteDTO<{
  database: IPostModel;
  cache: ICacheRepositoryAdapter;
}>;

export type {
  IPostEntity,
  IPostModel,
  ICachePostDTO,
  ICacheUserPostsDTO,
  IResolvePostFromIndexDTO,
  ICreatePostDTO,
  IFindPostDTO,
  IFindAllPostsDTO,
  IFindUserPostsDTO,
  IUpdatePostDTO,
  IDeletePostDTO
};
