import { IUserModel } from "@/server/models/user";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

type IRegisterUserDTO = {
  email: string;
  name: string;
  password: string;
  repositories: {
    database: IUserModel;
  };
  helpers: {
    hashing: IPasswordHashingHelperAdapter;
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { IRegisterUserDTO };
