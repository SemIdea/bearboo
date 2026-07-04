import { ISessionModel } from "@/server/models/session";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

type ICreateAuthSessionDTO = {
  userId: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { ICreateAuthSessionDTO };
