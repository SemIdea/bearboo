import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/helpers/cache/adapter";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";

type IRegisterUserDTO = {
  email: string;
  password: string;
  repositories: IRegisterUserRepositories;
};

type IRegisterUserRepositories = {
  database: IUserModel;
  cache: ICacheRepositoryAdapter;
  hashing: IPasswordHashingHelperAdapter;
};

export type { IRegisterUserDTO, IRegisterUserRepositories };
