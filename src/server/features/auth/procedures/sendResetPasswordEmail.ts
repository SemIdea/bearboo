import { publicProcedure } from "@/server/createRouter";
import { CreateResetTokenService } from "../domain/createResetToken";
import { SendMailByUserIdService } from "../../mail/domain/sendMailByUserId";
import {
  sendResetPasswordEmailSchema,
  sendResetPasswordEmailOutputSchema
} from "../schema";

const sendResetPasswordEmailProcedure = publicProcedure
  .input(sendResetPasswordEmailSchema)
  .output(sendResetPasswordEmailOutputSchema)
  .mutation(async ({ input, ctx }) => {
    const resetToken = await CreateResetTokenService({ ...input, ctx });

    await SendMailByUserIdService({
      userId: resetToken.userId,
      subject: "Reset Your Password",
      body: `
        <h2>Password Reset Request</h2>
        <p>Hello {{name}},</p>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <p><a href="http://localhost:3000/auth/recover/${resetToken.token}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>http://localhost:3000/auth/recover/${resetToken.token}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      `,
      ctx
    });

    return {
      success: true
    };
  });

export { sendResetPasswordEmailProcedure };
