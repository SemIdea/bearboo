import { TRPCError } from "@trpc/server";
import { assertRateLimit, t } from "@/server/createRouter";
import { SessionErrorCode } from "@/shared/error/session";
import { REFRESH_RATE_LIMIT, SESSION_MAX_LIFETIME_MS } from "../constants";
import { domain_readSessionByRefreshToken } from "../domain/readSessionByRefreshToken";
import { domain_refreshSession } from "../domain/refreshSession";
import { refreshSessionOutputSchema } from "../schema";

const procedure_refreshSession = t.procedure
	.output(refreshSessionOutputSchema)
	.mutation(async ({ ctx }) => {
		const refreshToken = ctx.refreshToken;

		if (!refreshToken) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: SessionErrorCode.MISSING_TOKEN,
			});
		}

		await assertRateLimit(ctx, `refresh:${refreshToken}`, REFRESH_RATE_LIMIT);

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
	});

export { procedure_refreshSession };
