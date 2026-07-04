import { IUserModel } from "@/server/models/user";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";

type ILoginUserDTO = {
  email: string;
  password: string;
  repositories: {
    database: IUserModel;
  };
  helpers: {
    hashing: IPasswordHashingHelperAdapter;
  };
};

export type { ILoginUserDTO };
