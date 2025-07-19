import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IGetUserProfileDTO = {
  id: string;
  repositories: IGetUserProfileRepositories;
};

type IGetUserProfileRepositories = {
  database: IUserModel;
  cache: ICacheRepositoryAdapter;
};

export type { IGetUserProfileDTO, IGetUserProfileRepositories };
