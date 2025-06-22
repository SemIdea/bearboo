import { SessionEntity } from "../session/entity";
import { UserEntity } from "./entity";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IUserEntity = {
  email: string;
  password: string;
};

type IUserWithSession = Omit<UserEntity, "password"> & {
  session: Omit<SessionEntity, "userId">;
};

type IUserModel = {
  create: (id: string, data: IUserEntity) => Promise<UserEntity>;
  find: (id: string) => Promise<UserEntity | null>;
  update: (id: string, data: IUserEntity) => Promise<UserEntity>;
  delete: (id: string) => Promise<void>;
  findByEmail: (email: string) => Promise<UserEntity | null>;
};

type ICacheUserDTO = {
  user: UserEntity;
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type IResolveUserFromIndexDTO = {
  indexKey: string;
  indexKeyCaller: (string: string) => string;
  findOnDatabase: (key: string) => Promise<UserEntity | null>;
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
