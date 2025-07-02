import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IGetUserProfileDTO = {
  id: string;
  repositories: IUserProfileRepositories;
};

type IUpdateUserProfileDTO = {
  id: string;
  name?: string;
  email?: string;
  bio?: string;
  repositories: IUserProfileRepositories;
};

type IUserProfileRepositories = {
  database: IUserModel;
  cache: ICacheRepositoryAdapter;
};

export type { IGetUserProfileDTO, IUpdateUserProfileDTO };
