import { TRPCError } from "@trpc/server";
import { IGetUserProfileDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";

const ReadUserProfileService = async ({
  repositories,
  ...data
}: IGetUserProfileDTO) => {
  const { userId } = data;

  const userProfile = await UserEntity.read({
    id: userId,
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

export { ReadUserProfileService };
