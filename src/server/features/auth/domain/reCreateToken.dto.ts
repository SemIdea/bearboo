import { IVerifyTokenModel } from "@/server/models/verifyToken";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";

type IReCreateTokenServiceDTO = {
  userEmail: string;
  repositories: {
    database: IVerifyTokenModel;
    user: IUserModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { IReCreateTokenServiceDTO };
