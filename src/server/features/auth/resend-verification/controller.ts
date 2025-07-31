import { CreateTokenService } from "../verify/service";
import { SendMailService } from "../../mail/service";
import { UserEntity } from "@/server/entities/user/entity";
import { IAPIContextDTO } from "@/server/createContext";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";

const resendVerificationEmailController = async ({
  input,
  ctx
}: {
  input: { email: string };
  ctx: IAPIContextDTO;
}) => {
  const user = await UserEntity.readByEmail({
    email: input.email,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    }
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  if (user.verified) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: UserErrorCode.USER_ALREADY_VERIFIED
    });
  }

  const verifyToken = await CreateTokenService({
    userId: user.id,
    repositories: {
      database: ctx.repositories.verifyToken
    },
    helpers: ctx.helpers
  });

  await SendMailService({
    to: user.email,
    subject: "Please verify your email address",
    body: `
      <h2>Email Verification</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a new verification email. Please click the link below to verify your email address:</p>
      <p><a href="http://localhost:3000/auth/verify?token=${verifyToken.token}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>http://localhost:3000/auth/verify?token=${verifyToken.token}</p>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p>If you didn't request this verification, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    `,
    gateways: ctx.gateways
  });

  return verifyToken;
};

export { resendVerificationEmailController };
