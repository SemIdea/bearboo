import { ISessionModel } from "@/server/entities/session/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IReadSessionByRefreshTokenDTO = {
  refreshToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type { IReadSessionByRefreshTokenDTO };
