import { Post } from "@prisma/client";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IPostEntity = {
  userId: string;
  title: string;
  content: string;
};

type IPostModel = {
  create: (id: string, data: IPostEntity) => Promise<Post>;
  find: (id: string) => Promise<Post | null>;
  findAll: () => Promise<Post[] | null>;
  findUserPosts: (userId: string) => Promise<Post[] | null>;
  update: (id: string, data: Partial<IPostEntity>) => Promise<Post>;
  delete: (id: string) => Promise<void>;
};

type ICachePostDTO = {
  post: Post;
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type ICacheUserPostsDTO = {
  userId: string;
  posts: Post[];
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type IResolvePostFromIndexDTO = {
  indexKey: string;
  indexKeyCaller: (key: string) => string;
  findOnDatabase: (id: string) => Promise<Post | null>;
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
  IDeletePostDTO,
};
