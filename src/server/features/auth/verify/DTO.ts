import { ITokenModel } from "@/server/entities/token/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

type ICreateTokenServiceDTO = {
  userId: string;
  repositories: {
    database: ITokenModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

type ITokenServiceDTO = {
  token: string;
  repositories: {
    database: ITokenModel;
    user: IUserModel;
  };
};

export type { ICreateTokenServiceDTO, ITokenServiceDTO };
