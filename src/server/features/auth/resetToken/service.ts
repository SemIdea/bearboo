import { UserEntity } from "@/server/entities/user/entity";
import { IResetPasswordDTO, ISendResetPasswordEmailDTO } from "./DTO";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";
import { ResetTokenEntity } from "@/server/entities/resetToken/entity";
import { ResetTokenErrorCodes } from "@/shared/error/resetToken";

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

export { CreateResetTokenService, ResetPasswordService };
