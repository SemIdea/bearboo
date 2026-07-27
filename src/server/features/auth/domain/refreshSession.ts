import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";

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
		throw new DomainError("session.session_update_error");
	}

	return newSession;
};

export { domain_refreshSession };
