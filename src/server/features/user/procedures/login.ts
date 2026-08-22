import { TRPCError } from "@trpc/server";
import { assertRateLimit, publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import {
	LOGIN_RATE_LIMIT,
	SESSION_MAX_LIFETIME_MS,
} from "../../auth/constants";
import { domain_createAuthSession } from "../../auth/domain/createAuthSession";
import { domain_loginUser } from "../domain/login";
import { loginUserOutputSchema, loginUserSchema } from "../schema";

const procedure_loginUser = publicProcedure
	.input(loginUserSchema)
	.output(loginUserOutputSchema)
	.mutation(async ({ input, ctx }) => {
		await assertRateLimit(ctx, `login:${input.email}`, LOGIN_RATE_LIMIT);

		try {
			const user = await domain_loginUser({ ctx, input });
			const session = await domain_createAuthSession({
				ctx,
				input: { userId: user.id },
			});

			const maxAgeSeconds = SESSION_MAX_LIFETIME_MS / 1000;

			ctx.resCookies.set("accessToken", session.accessToken, {
				maxAgeSeconds,
			});
			ctx.resCookies.set("refreshToken", session.refreshToken, {
				maxAgeSeconds,
			});

			return { user };
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
	});

export { procedure_loginUser };
