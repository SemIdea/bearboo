import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

type IRegisterUserDTO = {
  email: string;
  name: string;
  password: string;
  repositories: {
    database: IUserModel;
    cache: ICacheRepositoryAdapter;
  };
  helpers: {
    hashing: IPasswordHashingHelperAdapter;
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { IRegisterUserDTO };
