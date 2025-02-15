import { User } from "@prisma/client";

type IUserEntity = {
  email: string;
  password: string;
};

type IUserModel = {
  create: (id: string, data: IUserEntity) => Promise<User>;
  read: (id: string) => Promise<User | null>;
  update: (id: string, data: IUserEntity) => Promise<User>;
  delete: (id: string) => Promise<void>;
  findByEmail: (email: string) => Promise<User | null>;
};

export type { IUserModel, IUserEntity };
