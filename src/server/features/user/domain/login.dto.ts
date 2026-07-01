import { IUserModel } from "@/server/entities/user/DTO";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type ILoginUserDTO = {
  email: string;
  password: string;
  repositories: {
    database: IUserModel;
    cache: ICacheRepositoryAdapter;
  };
  helpers: {
    hashing: IPasswordHashingHelperAdapter;
  };
};

export type { ILoginUserDTO };
