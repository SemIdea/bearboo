import { UserEntity } from "@/server/entities/user/entity";
import { ISendResetPasswordEmailDTO } from "./createResetToken.dto";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";
import { ResetTokenEntity } from "@/server/entities/resetToken/entity";

const CreateResetTokenService = async ({
  repositories,
  helpers,
  ...data
}: ISendResetPasswordEmailDTO) => {
  const user = await UserEntity.readByEmail({
    email: data.email,
    repositories: {
      ...repositories
    }
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const resetTokenId = helpers.uid.generate();
  const newResetToken = helpers.uid.generate();

  const resetToken = await ResetTokenEntity.create({
    id: resetTokenId,
    data: {
      userId: user.id,
      token: newResetToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      used: false
    },
    repositories: {
      ...repositories,
      database: repositories.resetToken
    }
  });

  return resetToken;
};

export { CreateResetTokenService };
