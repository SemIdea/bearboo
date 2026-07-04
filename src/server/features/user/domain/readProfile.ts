import { TRPCError } from "@trpc/server";
import { IUserModel } from "@/server/models/user";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserProfileInput } from "../schema";

type Params = ReadUserProfileInput & {
  repositories: {
    database: IUserModel;
  };
};

const ReadUserProfileService = async ({ repositories, id }: Params) => {
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
