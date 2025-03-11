import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";
import { Post } from "@prisma/client";

type IPostEntity = {
  userId: string;
  title: string;
  content: string;
};

type IPostModel = {
  create: (id: string, data: IPostEntity) => Promise<Post>;
  read: (id: string) => Promise<Post | null>;
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

type IFindUserPostsDTO = {
  userId: string;
  repositories: {
    database: IPostModel;
  };
};

type IDeletePostDTO = {
  id: string;
  repositories: {
    database: IPostModel;
  };
};

export type {
  IPostEntity,
  IPostModel,
  ICreatePostDTO,
  IFindUserPostsDTO,
  IDeletePostDTO,
};
