import { CreateDTO, DeleteDTO, FindDTO, WithRepositories } from "../base/DTO";
import { IBaseModel } from "../base/model";
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

type ISessionModel = IBaseModel<SessionEntity, "id"> & {
  findByAccessToken: (accessToken: string) => Promise<SessionEntity | null>;
  findByRefreshToken: (refreshToken: string) => Promise<SessionEntity | null>;
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

type ICreateSessionDTO = CreateDTO<
  ISessionEntity,
  {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  }
>;

type IFindSessionByIdDTO = FindDTO<{
  database: ISessionModel;
  cache: ICacheRepositoryAdapter;
}>;

type IFindSessionByAccessTokenDTO = {
  accessToken: string;
} & WithRepositories<{
  database: ISessionModel;
  cache: ICacheRepositoryAdapter;
}>;

type IFindSessionByRefreshTokenDTO = {
  refreshToken: string;
} & WithRepositories<{
  database: ISessionModel;
  cache: ICacheRepositoryAdapter;
}>;

type IRefreshSessionDTO = {
  id: string;
  refreshToken: string;
  accessToken: string;
  newRefreshToken: string;
  newAccessToken: string;
} & WithRepositories<{
  database: ISessionModel;
  cache: ICacheRepositoryAdapter;
}>;

type IDeletePostDTO = DeleteDTO<{
  database: ISessionModel;
  cache: ICacheRepositoryAdapter;
}>;

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
