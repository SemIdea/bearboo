import { IUserModel } from "@/server/models/user";
import { UpdateUserProfileInput } from "../schema";

type Params = UpdateUserProfileInput & {
  id: string;
  repositories: {
    database: IUserModel;
  };
};

const UpdateUserProfileService = async ({ repositories, ...data }: Params) => {
  const updatedProfile = await repositories.database.update(data.id, {
    name: data.name,
    email: data.email,
    bio: data.bio
  });

  return updatedProfile;
};

export { UpdateUserProfileService };
