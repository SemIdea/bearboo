import { TRPCError } from "@trpc/server";
import { IGetUserProfileDTO } from "./DTO";
import { UserEntity } from "@/server/entities/user/entity";
import { AuthErrorCode } from "@/shared/error/auth";

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
    throw new TRPCError({
      code: "NOT_FOUND",
      message: AuthErrorCode.USER_NOT_FOUD,
    });
  }

  const { password, ...userWithoutPassword } = userProfile;

  return userWithoutPassword;
};

export { GetUserProfileService };
