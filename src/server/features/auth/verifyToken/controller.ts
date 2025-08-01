import { IAPIContextDTO } from "@/server/createContext";
import { VerifyTokenInput } from "@/server/schema/token.schema";
import { ReCreateTokenService, VerifyTokenService } from "./service";
import { SendMailByUserIdService, SendMailService } from "../../mail/service";

const verifyTokenController = async ({
  input,
  ctx
}: {
  input: VerifyTokenInput;
  ctx: IAPIContextDTO;
}) => {
  const token = await VerifyTokenService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.verifyToken
    }
  });

  return token;
};

const resendVerificationEmailController = async ({
  input,
  ctx
}: {
  input: { email: string };
  ctx: IAPIContextDTO;
}) => {
  const token = await ReCreateTokenService({
    userId: input.email,
    repositories: {
      database: ctx.repositories.verifyToken
    },
    helpers: ctx.helpers
  });

  await SendMailByUserIdService({
    userId: input.email,
    subject: "Please verify your email address",
    body: `
      <h2>Email Verification</h2>
      <p>Hello {{name}},</p>
      <p>You requested a new verification email. Please click the link below to verify your email address:</p>
      <p><a href="http://localhost:3000/auth/verify?token=${token.token}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>http://localhost:3000/auth/verify?token=${token.token}</p>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p>If you didn't request this verification, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    `,
    repositories: {
      database: ctx.repositories.user
    },
    gateways: ctx.gateways
  });

  return token;
};

export { verifyTokenController, resendVerificationEmailController };
