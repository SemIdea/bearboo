import { IVerifyTokenModel } from "@/server/entities/verifyToken/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

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

type IReCreateTokenServiceDTO = {
  userEmail: string;
  repositories: {
    database: IVerifyTokenModel;
    user: IUserModel;
    cache: ICacheRepositoryAdapter;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type {
  ICreateTokenServiceDTO,
  ITokenServiceDTO,
  IReCreateTokenServiceDTO
};
