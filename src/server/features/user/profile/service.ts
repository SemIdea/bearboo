import { TRPCError } from "@trpc/server";
import { IGetUserProfileDTO, IUpdateUserProfileDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";

const ReadUserProfileService = async ({
  repositories,
  ...data
}: IGetUserProfileDTO) => {
  const { id } = data;

  const userProfile = await UserEntity.read({
    id,
    repositories
  });

  if (!userProfile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUD
    });
  }

  const { password, ...userWithoutPassword } = userProfile;

  return userWithoutPassword;
};

const UpdateUserProfileService = async ({
  repositories,
  ...data
}: IUpdateUserProfileDTO) => {
  const { id, ...updateData } = data;

  const updatedProfile = await UserEntity.update({
    id,
    data: updateData,
    repositories
  });

  if (!updatedProfile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUD
    });
  }

  return updatedProfile;
};

export { ReadUserProfileService, UpdateUserProfileService };
