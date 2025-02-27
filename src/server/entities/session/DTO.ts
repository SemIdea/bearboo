import { Session } from "@prisma/client";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type ISessionEntity = {
  userId: string;
  accessToken: string;
  refreshToken: string;
};

type ISessionModel = {
  create: (id: string, data: ISessionEntity) => Promise<Session>;
  read: (id: string) => Promise<Session | null>;
  findByAccessToken: (accessToken: string) => Promise<Session | null>;
  findByRefreshToken: (refreshToken: string) => Promise<Session | null>;
  update: (id: string, data: Partial<ISessionEntity>) => Promise<Session>;
  delete: (id: string) => Promise<void>;
};

type ICreateSessionDTO = {
  id: string;
  data: ISessionEntity;
  repositories: {
    database: ISessionModel;
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
  };
};

type IRefreshSessionDTO = {
  id: string;
  refreshToken: string;
  accessToken: string;
  repositories: {
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type {
  ISessionModel,
  ISessionEntity,
  ICreateSessionDTO,
  IFindSessionByAccessTokenDTO,
  IFindSessionByRefreshTokenDTO,
  IRefreshSessionDTO,
};
