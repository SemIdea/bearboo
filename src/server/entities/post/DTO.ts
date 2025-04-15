import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";
import { Post } from "@prisma/client";

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
  ICreatePostDTO,
  IFindPostDTO,
  IFindAllPostsDTO,
  IFindUserPostsDTO,
  IUpdatePostDTO,
  IDeletePostDTO,
};
