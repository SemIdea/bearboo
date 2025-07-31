import { UserEntity } from "@/server/entities/user/entity";
import { IResetPasswordDTO, ISendResetPasswordEmailDTO } from "./DTO";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";
import { ResetTokenEntity } from "@/server/entities/resetToken/entity";
import { ResetTokenErrorCodes } from "@/shared/error/resetToken";

const SendResetPasswordEmailService = async ({
  repositories,
  helpers,
  gateways,
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

  await gateways.mail.sendMail({
    to: user.email,
    subject: "Reset Your Password",
    body: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <p><a href="http://localhost:3000/auth/reset-password?token=${resetToken.token}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>http://localhost:3000/auth/reset-password?token=${resetToken.token}</p>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    `
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

export { SendResetPasswordEmailService, ResetPasswordService };
