import { publicProcedure } from "@/server/createRouter";
import { domain_sendMail } from "../../mail/domain/sendMail";
import { domain_reCreateToken } from "../domain/reCreateToken";
import {
	resendVerificationEmailOutputSchema,
	resendVerificationEmailSchema,
} from "../schema";

const procedure_resendVerificationEmail = publicProcedure
	.input(resendVerificationEmailSchema)
	.output(resendVerificationEmailOutputSchema)
	.mutation(async ({ input, ctx }) => {
		const token = await domain_reCreateToken({
			ctx,
			input: { userEmail: input.email },
		});

		await domain_sendMail({
			ctx,
			input: {
				to: input.email,
				subject: "Please verify your email address",
				body: `
        <h2>Email Verification</h2>
        <p>Hello {{name}},</p>
        <p>You requested a new verification email. Please click the link below to verify your email address:</p>
        <p><a href="${ctx.env.siteUrl}/auth/verify/${token.token}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${ctx.env.siteUrl}/auth/verify/${token.token}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      `,
			},
		});

		return token;
	});

export { procedure_resendVerificationEmail };
