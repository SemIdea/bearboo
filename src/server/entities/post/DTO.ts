import { PostEntity } from "./entity";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IPostEntity = {
  userId: string;
  title: string;
  content: string;
};

type IPostModel = {
  create: (id: string, data: IPostEntity) => Promise<PostEntity>;
  find: (id: string) => Promise<PostEntity | null>;
  findAll: () => Promise<PostEntity[]>;
  findUserPosts: (userId: string) => Promise<PostEntity[]>;
  update: (id: string, data: Partial<IPostEntity>) => Promise<PostEntity>;
  delete: (id: string) => Promise<void>;
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

type ICreatePostDTO = {
  id: string;
  data: {
    userId: string;
    title: string;
    content: string;
  };
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IFindPostDTO = {
  id: string;
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IFindAllPostsDTO = {
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IFindUserPostsDTO = {
  userId: string;
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IUpdatePostDTO = {
  id: string;
  data: Partial<IPostEntity>;
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IDeletePostDTO = {
  id: string;
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

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
