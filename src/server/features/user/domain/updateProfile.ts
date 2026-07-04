import { IUpdateUserProfileDTO } from "./updateProfile.dto";

const UpdateUserProfileService = async ({
  repositories,
  ...data
}: IUpdateUserProfileDTO) => {
  const updatedProfile = await repositories.database.update(data.id, {
    name: data.name,
    email: data.email,
    bio: data.bio
  });

  return updatedProfile;
};

export { UpdateUserProfileService };
