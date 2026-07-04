import { IVerifyTokenModel } from "@/server/models/verifyToken";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";

type ICreateTokenServiceDTO = {
  userId: string;
  repositories: {
    database: IVerifyTokenModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { ICreateTokenServiceDTO };
