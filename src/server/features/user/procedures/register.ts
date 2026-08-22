import { TRPCError } from "@trpc/server";
import { assertRateLimit, publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { REGISTER_RATE_LIMIT } from "../../auth/constants";
import { domain_createToken } from "../../auth/domain/createToken";
import { domain_sendMail } from "../../mail/domain/sendMail";
import { domain_registerUser } from "../domain/register";
import { registerUserOutputSchema, registerUserSchema } from "../schema";

const procedure_registerUser = publicProcedure
	.input(registerUserSchema)
	.output(registerUserOutputSchema)
	.mutation(async ({ input, ctx }) => {
		await assertRateLimit(ctx, `register:${input.email}`, REGISTER_RATE_LIMIT);

		let user: Awaited<ReturnType<typeof domain_registerUser>>;

		try {
			user = await domain_registerUser({ ctx, input });
		} catch (error) {
			if (error instanceof DomainError) {
				throw new TRPCError({
					code: error.httpCode,
					message: error.message,
					cause: error,
				});
			}

			throw error;
		}

		const verifyToken = await domain_createToken({
			ctx,
			input: { userId: user.id },
		});

		await domain_sendMail({
			ctx,
			input: {
				to: user.email,
				subject: "Please verify your email address",
				body: `
        <h2>Welcome to our platform!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering! To complete your account setup, please verify your email address by clicking the link below:</p>
        <p><a href="http://localhost:3000/auth/verify/${verifyToken.token}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email Address</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>http://localhost:3000/auth/verify/${verifyToken.token}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Team</p>
      `,
			},
		}).catch((error) => {
			console.error("Error sending verification email:", error);
			throw new Error("Failed to send verification email");
		});

		return { user };
	});

export { procedure_registerUser };
