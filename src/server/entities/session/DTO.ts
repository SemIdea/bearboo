import { UserEntity } from "../user/entity";
import { SessionEntity } from "./entity";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type ISessionEntity = {
  userId: string;
  accessToken: string;
  refreshToken: string;
};

type ISessionWithUser = Omit<SessionEntity, "userId" | "id"> & {
  user: Omit<UserEntity, "password">;
};

type ISessionModel = {
  create: (id: string, data: ISessionEntity) => Promise<SessionEntity>;
  find: (id: string) => Promise<SessionEntity | null>;
  findByAccessToken: (accessToken: string) => Promise<SessionEntity | null>;
  findByRefreshToken: (refreshToken: string) => Promise<SessionEntity | null>;
  update: (id: string, data: Partial<ISessionEntity>) => Promise<SessionEntity>;
  delete: (id: string) => Promise<void>;
};

type ICacheSessionDTO = {
  session: SessionEntity;
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type IResolveSessionFromIndexDTO = {
  indexKey: string;
  indexKeyCaller: (string: string) => string;
  findOnDatabase: (key: string) => Promise<SessionEntity | null>;
  repositories: {
    cache: ICacheRepositoryAdapter;
  };
};

type ICreateSessionDTO = {
  id: string;
  data: ISessionEntity;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IFindSessionByIdDTO = {
  id: string;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IFindSessionByAccessTokenDTO = {
  accessToken: string;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IFindSessionByRefreshTokenDTO = {
  refreshToken: string;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IDeletePostDTO = {
  id: string;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IRefreshSessionDTO = {
  id: string;
  refreshToken: string;
  accessToken: string;
  newRefreshToken: string;
  newAccessToken: string;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type {
  ISessionModel,
  ISessionWithUser,
  ISessionEntity,
  ICacheSessionDTO,
  IResolveSessionFromIndexDTO,
  ICreateSessionDTO,
  IFindSessionByIdDTO,
  IFindSessionByAccessTokenDTO,
  IFindSessionByRefreshTokenDTO,
  IDeletePostDTO,
  IRefreshSessionDTO
};
