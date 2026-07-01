import { IUpdateUserProfileDTO } from "./updateProfile.dto";
import { UserEntity } from "@/server/entities/user/entity";

const UpdateUserProfileService = async ({
  repositories,
  ...data
}: IUpdateUserProfileDTO) => {
  const updatedProfile = await UserEntity.update({
    ...data,
    data,
    repositories
  });

  return updatedProfile;
};

export { UpdateUserProfileService };
