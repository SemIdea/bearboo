import { TRPCError } from "@trpc/server";
import { assertRateLimit, t } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { REFRESH_RATE_LIMIT, SESSION_MAX_LIFETIME_MS } from "../constants";
import { domain_readSessionByRefreshToken } from "../domain/readSessionByRefreshToken";
import { domain_refreshSession } from "../domain/refreshSession";
import { refreshSessionOutputSchema } from "../schema";

const procedure_refreshSession = t.procedure
	.output(refreshSessionOutputSchema)
	.mutation(async ({ ctx }) => {
		const refreshToken = ctx.refreshToken;

		if (!refreshToken) {
			const error = new DomainError("session.missing_token");
			throw new TRPCError({
				code: error.httpCode,
				message: error.message,
				cause: error,
			});
		}

		await assertRateLimit(ctx, `refresh:${refreshToken}`, REFRESH_RATE_LIMIT);

		try {
			const session = await domain_readSessionByRefreshToken({
				ctx,
				input: { refreshToken },
			}).catch((error) => {
				ctx.resCookies.clear("accessToken");
				ctx.resCookies.clear("refreshToken");
				throw error;
			});

			const refreshedSession = await domain_refreshSession({
				ctx,
				input: { id: session.id, currentRefreshToken: refreshToken },
			});

			const maxAgeSeconds = SESSION_MAX_LIFETIME_MS / 1000;

			ctx.resCookies.set("accessToken", refreshedSession.accessToken, {
				maxAgeSeconds,
			});
			ctx.resCookies.set("refreshToken", refreshedSession.refreshToken, {
				maxAgeSeconds,
			});

			return { success: true };
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

export { procedure_refreshSession };
