import { IUserProfileRepositories } from "./readProfile.dto";

type IUpdateUserProfileDTO = {
  id: string;
  name?: string;
  email?: string;
  bio?: string;
  repositories: IUserProfileRepositories;
};

export type { IUpdateUserProfileDTO };
