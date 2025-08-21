import { TRPCError } from "@trpc/server";
import { IGetUserProfileDTO, IUpdateUserProfileDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";

const ReadUserProfileService = async ({
  repositories,
  ...data
}: IGetUserProfileDTO) => {
  const userProfile = await UserEntity.read({
    ...data,
    repositories
  });

  if (!userProfile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const { password, ...userWithoutPassword } = userProfile;

  return userWithoutPassword;
};

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

export { ReadUserProfileService, UpdateUserProfileService };
