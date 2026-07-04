import { IVerifyTokenModel } from "@/server/models/verifyToken";
import { IUserModel } from "@/server/models/user";

type ITokenServiceDTO = {
  token: string;
  repositories: {
    database: IVerifyTokenModel;
    user: IUserModel;
  };
};

export type { ITokenServiceDTO };
