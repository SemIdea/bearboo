import { IVerifyTokenModel } from "@/server/entities/verifyToken/DTO";
import { IUserModel } from "@/server/entities/user/DTO";

type ITokenServiceDTO = {
  token: string;
  repositories: {
    database: IVerifyTokenModel;
    user: IUserModel;
  };
};

export type { ITokenServiceDTO };
