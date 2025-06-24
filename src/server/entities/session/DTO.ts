import { IEntityDatabaseRepository } from "../base/entity";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type ISessionEntity = {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
};

type ISessionWithUser = Omit<ISessionEntity, "userId" | "id"> & {
  user: Omit<ISessionEntity, "password">;
};

type ISessionExtraRepositories = {
  readByAccessToken: (accessToken: string) => Promise<ISessionEntity | null>;
  readByRefreshToken: (refreshToken: string) => Promise<ISessionEntity | null>;
};

type ISessionModel = IEntityDatabaseRepository<
  ISessionEntity,
  ISessionExtraRepositories
>;

type IReadSessionByAccessTokenDTO = {
  accessToken: string;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IReadSessionByRefreshTokenDTO = {
  refreshToken: string;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

type IRefreshSessionDTO = {
  id: string;
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
  IReadSessionByAccessTokenDTO,
  IReadSessionByRefreshTokenDTO,
  IRefreshSessionDTO
};
