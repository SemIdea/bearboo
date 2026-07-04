import { IResetPasswordDTO } from "./resetPassword.dto";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";
import { ResetTokenErrorCodes } from "@/shared/error/resetToken";

const ResetPasswordService = async ({
  repositories,
  helpers,
  ...data
}: IResetPasswordDTO) => {
  const resetToken = await repositories.resetToken.readByToken(data.token);

  if (!resetToken) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ResetTokenErrorCodes.TOKEN_NOT_FOUND
    });
  }

  if (resetToken.used) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ResetTokenErrorCodes.TOKEN_ALREADY_USED
    });
  }

  if (resetToken.expiresAt < new Date()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ResetTokenErrorCodes.TOKEN_EXPIRED
    });
  }

  if (data.newPassword !== data.confirmNewPassword) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: UserErrorCode.PASSWORDS_DO_NOT_MATCH
    });
  }

  const user = await repositories.database.read(resetToken.userId);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  await repositories.resetToken.update(resetToken.id, {
    used: true
  });

  const updatedUser = await repositories.database.update(user.id, {
    password: await helpers.hashing.hash(data.newPassword)
  });

  return updatedUser;
};

export { ResetPasswordService };
