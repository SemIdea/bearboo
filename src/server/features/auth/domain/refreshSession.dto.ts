import { ISessionModel } from "@/server/models/session";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

type IRefreshSessionDTO = {
  id: string;
  accessToken: string;
  refreshToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { IRefreshSessionDTO };
