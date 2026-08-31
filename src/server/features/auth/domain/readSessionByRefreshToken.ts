import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";

const invalidTokenError = new AppError("session.refresh_token_invalid");

const domain_readSessionByRefreshToken = async ({
	ctx,
	input,
}: DomainInput<{ refreshToken: string }>) => {
	const session = await ctx.repositories.session.readByRefreshToken(
		input.refreshToken,
	);

	if (session) return session;

	const reusedSession =
		await ctx.repositories.session.readByPreviousRefreshToken(
			input.refreshToken,
		);

	if (reusedSession) {
		await ctx.repositories.session.delete(reusedSession.id);
	}

	throw invalidTokenError;
};

export { domain_readSessionByRefreshToken };
