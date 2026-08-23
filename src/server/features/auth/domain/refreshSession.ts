import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";

const domain_refreshSession = async ({
	ctx,
	input,
}: DomainInput<{ id: string; currentRefreshToken: string }>) => {
	const newAccessToken = ctx.helpers.uid.generate();
	const newRefreshToken = ctx.helpers.uid.generate();

	const newSession = await ctx.repositories.session.update(input.id, {
		accessToken: newAccessToken,
		refreshToken: newRefreshToken,
		previousRefreshToken: input.currentRefreshToken,
	});

	if (!newSession) {
		throw new AppError("session.session_update_error");
	}

	return newSession;
};

export { domain_refreshSession };
