import { assertRateLimit, publicProcedure } from "@/server/createRouter";
import { domain_sendMailByUserId } from "../../mail/domain/sendMailByUserId";
import { RESET_RATE_LIMIT } from "../constants";
import { domain_createResetToken } from "../domain/createResetToken";
import {
	sendResetPasswordEmailOutputSchema,
	sendResetPasswordEmailSchema,
} from "../schema";

const procedure_sendResetPasswordEmail = publicProcedure
	.input(sendResetPasswordEmailSchema)
	.output(sendResetPasswordEmailOutputSchema)
	.mutation(async ({ input, ctx }) => {
		await assertRateLimit(ctx, `reset:${input.email}`, RESET_RATE_LIMIT);

		const resetToken = await domain_createResetToken({ ctx, input });

		if (resetToken) {
			await domain_sendMailByUserId({
				ctx,
				input: {
					userId: resetToken.userId,
					subject: "Reset Your Password",
					body: `
        <h2>Password Reset Request</h2>
        <p>Hello {{name}},</p>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <p><a href="${ctx.env.siteUrl}/auth/recover/${resetToken.token}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${ctx.env.siteUrl}/auth/recover/${resetToken.token}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      `,
				},
			});
		}

		return {
			success: true,
		};
	});

export { procedure_sendResetPasswordEmail };
