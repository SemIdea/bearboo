import { IVerifyTokenModel } from "@/server/entities/verifyToken/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

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

export type { IReCreateTokenServiceDTO };
