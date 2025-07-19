import { ISessionModel } from "@/server/entities/session/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type ICreateAuthSessionDTO = {
  userId: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
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
  userId: string;
  sessionId: string;
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
  newAccessToken: string;
  newRefreshToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type {
  ICreateAuthSessionDTO,
  IReadUserAndSessionByAccessTokenDTO,
  IReadSessionByRefreshTokenDTO,
  IDeleteSessionDTO,
  IRefreshSessionDTO
};
