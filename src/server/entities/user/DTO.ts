import { Session, User } from "@prisma/client";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IUserEntity = {
  email: string;
  password: string;
};

type IUserWithSession = Omit<User, "password"> & {
  session: Omit<Session, "userId">;
};

type IUserModel = {
  create: (id: string, data: IUserEntity) => Promise<User>;
  find: (id: string) => Promise<User | null>;
  update: (id: string, data: IUserEntity) => Promise<User>;
  delete: (id: string) => Promise<void>;
  findByEmail: (email: string) => Promise<User | null>;
};

type ICacheUserDTO = {
  user: User;
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type IResolveUserFromIndexDTO = {
  indexKey: string;
  indexKeyCaller: (string: string) => string;
  findOnDatabase: (key: string) => Promise<User | null>;
  repositories: {
    database: IUserModel;
    cache: ICacheRepositoryAdapter;
  };
};

type ICreateUserDTO = {
  id: string;
  data: IUserEntity;
  repositories: {
    database: IUserModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IFindUserDTO = {
  id: string;
  repositories: {
    database: IUserModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IFindUserByEmailDTO = {
  email: string;
  repositories: {
    database: IUserModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type {
  IUserModel,
  IUserEntity,
  IUserWithSession,
  ICacheUserDTO,
  IResolveUserFromIndexDTO,
  ICreateUserDTO,
  IFindUserDTO,
  IFindUserByEmailDTO
};
