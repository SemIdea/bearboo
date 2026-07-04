import { TRPCError } from "@trpc/server";
import { IResetTokenModel } from "@/server/models/resetToken";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";
import { UserErrorCode } from "@/shared/error/user";
import { SendResetPasswordEmailInput } from "../schema";

type Params = SendResetPasswordEmailInput & {
  repositories: {
    database: IUserModel;
    resetToken: IResetTokenModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

const CreateResetTokenService = async ({
  repositories,
  helpers,
  ...data
}: Params) => {
  const user = await repositories.database.readByEmail(data.email);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const resetTokenId = helpers.uid.generate();
  const newResetToken = helpers.uid.generate();

  const resetToken = await repositories.resetToken.create(resetTokenId, {
    userId: user.id,
    token: newResetToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    used: false
  });

  return resetToken;
};

export { CreateResetTokenService };
