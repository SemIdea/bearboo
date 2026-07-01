import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IUserProfileRepositories = {
  database: IUserModel;
  cache: ICacheRepositoryAdapter;
};

type IGetUserProfileDTO = {
  id: string;
  repositories: IUserProfileRepositories;
};

export type { IGetUserProfileDTO, IUserProfileRepositories };
