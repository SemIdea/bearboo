import { IUserModel } from "@/server/models/user";
import { IPasswordHashingHelperAdapter } from "@/lib/passwordHashing/adapter";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";

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
