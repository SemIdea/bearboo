import { TRPCError } from "@trpc/server";
import { IGetUserProfileDTO } from "./readProfile.dto";
import { UserErrorCode } from "@/shared/error/user";

const ReadUserProfileService = async ({
  repositories,
  id
}: IGetUserProfileDTO) => {
  const userProfile = await repositories.database.read(id);

  if (!userProfile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const { password, ...userWithoutPassword } = userProfile;

  return userWithoutPassword;
};

export { ReadUserProfileService };
