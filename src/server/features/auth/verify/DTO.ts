import { IVerifyTokenModel } from "@/server/entities/verifyToken/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

type ICreateTokenServiceDTO = {
  userId: string;
  repositories: {
    database: IVerifyTokenModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

type ITokenServiceDTO = {
  token: string;
  repositories: {
    database: IVerifyTokenModel;
    user: IUserModel;
  };
};

export type { ICreateTokenServiceDTO, ITokenServiceDTO };
