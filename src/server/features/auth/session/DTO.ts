import { ISessionModel } from "@/server/entities/session/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type ICreateAuthSessionDTO = {
  userId: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

type IReadUserAndSessionByAccessTokenDTO = {
  accessToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IReadSessionByRefreshTokenDTO = {
  refreshToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IDeleteSessionDTO = {
  id: string;
  userId: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IRefreshSessionDTO = {
  id: string;
  accessToken: string;
  refreshToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type {
  ICreateAuthSessionDTO,
  IReadUserAndSessionByAccessTokenDTO,
  IReadSessionByRefreshTokenDTO,
  IDeleteSessionDTO,
  IRefreshSessionDTO
};
