import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { SessionErrorCode } from "@/shared/error/session";

const domain_refreshSession = async ({
	ctx,
	input,
}: DomainInput<{ id: string }>) => {
	const newAccessToken = ctx.helpers.uid.generate();
	const newRefreshToken = ctx.helpers.uid.generate();

	const newSession = await ctx.repositories.session.update(input.id, {
		accessToken: newAccessToken,
		refreshToken: newRefreshToken,
	});

	if (!newSession) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: SessionErrorCode.SESSION_UPDATE_ERROR,
		});
	}

	return newSession;
};

export { domain_refreshSession };
