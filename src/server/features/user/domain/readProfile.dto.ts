import { IUserModel } from "@/server/models/user";

type IUserProfileRepositories = {
  database: IUserModel;
};

type IGetUserProfileDTO = {
  id: string;
  repositories: IUserProfileRepositories;
};

export type { IGetUserProfileDTO, IUserProfileRepositories };
