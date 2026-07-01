import { UserEntity } from "@/server/entities/user/entity";
import { IResetPasswordDTO } from "./resetPassword.dto";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";
import { ResetTokenEntity } from "@/server/entities/resetToken/entity";
import { ResetTokenErrorCodes } from "@/shared/error/resetToken";

const ResetPasswordService = async ({
  repositories,
  helpers,
  ...data
}: IResetPasswordDTO) => {
  const resetToken = await ResetTokenEntity.readByToken({
    token: data.token,
    repositories: {
      ...repositories,
      database: repositories.resetToken
    }
  });

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

  const user = await UserEntity.read({
    id: resetToken.userId,
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

  await ResetTokenEntity.update({
    id: resetToken.id,
    data: {
      used: true
    },
    repositories: {
      ...repositories,
      database: repositories.resetToken
    }
  });

  const updatedUser = await UserEntity.update({
    id: user.id,
    data: {
      password: await helpers.hashing.hash(data.newPassword)
    },
    repositories: {
      ...repositories
    }
  });

  return updatedUser;
};

export { ResetPasswordService };
