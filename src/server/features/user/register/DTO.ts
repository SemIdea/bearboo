import { IUserModel } from "@/server/entities/user/DTO";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";

type IRegisterUserDTO = {
  email: string;
  password: string;
  repositories: IRegisterUserRepositories;
};

type IRegisterUserRepositories = {
  database: IUserModel;
  cache: any;
  hashing: IPasswordHashingHelperAdapter;
};

export type { IRegisterUserDTO, IRegisterUserRepositories };
