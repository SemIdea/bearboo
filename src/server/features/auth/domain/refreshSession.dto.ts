import { ISessionModel } from "@/server/entities/session/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

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

export type { IRefreshSessionDTO };
