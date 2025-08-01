import { RegisterUserService } from "./service";
import { CreateUserInput } from "@/server/schema/user.schema";
import { IAPIContextDTO } from "@/server/createContext";
import { SendMailService } from "../../mail/service";
import { CreateTokenService } from "../../auth/verifyToken/service";

const registerUserController = async ({
  input,
  ctx
}: {
  input: CreateUserInput;
  ctx: IAPIContextDTO;
}) => {
  const user = await RegisterUserService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.user
    },
    helpers: ctx.helpers
  });

  const verifyToken = await CreateTokenService({
    userId: user.id,
    repositories: {
      database: ctx.repositories.verifyToken
    },
    helpers: ctx.helpers
  });

  const mail = await SendMailService({
    to: user.email,
    subject: "Please verify your email address",
    body: `
      <h2>Welcome to our platform!</h2>
      <p>Hello ${user.name},</p>
      <p>Thank you for registering! To complete your account setup, please verify your email address by clicking the link below:</p>
      <p><a href="http://localhost:3000/auth/verify?token=${verifyToken.token}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a></p>
      <p>Or copy and paste this link into your browser:</p>
      <p>http://localhost:3000/auth/verify?token=${verifyToken.token}</p>
      <p>This link will expire in 24 hours for security reasons.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <br>
      <p>Best regards,<br>The Team</p>
    `,
    gateways: ctx.gateways
  }).catch((error) => {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  });

  console.log("Mail sent:", mail);

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword
  };
};

export { registerUserController };
