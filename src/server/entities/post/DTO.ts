import { Post } from "@prisma/client";

type IPostEntity = {
  userId: string;
  title: string;
  content: string;
};

type IPostModel = {
  create: (id: string, data: IPostEntity) => Promise<Post>;
  read: (id: string) => Promise<Post | null>;
  update: (id: string, data: Partial<IPostEntity>) => Promise<Post>;
  delete: (id: string) => Promise<void>;
};

export type { IPostEntity, IPostModel };
