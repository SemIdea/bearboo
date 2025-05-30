import { IGetUserProfileDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";

const GetUserProfileService = async ({
  repositories,
  ...data
}: IGetUserProfileDTO) => {
  const { userId } = data;

  const userProfile = await UserEntity.find({
    id: userId,
    repositories,
  });

  if (!userProfile) {
    throw new Error("User profile not found");
  }

  const { password, ...userWithoutPassword } = userProfile;

  return userWithoutPassword;
};

export { GetUserProfileService };
