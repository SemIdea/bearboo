import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { SessionErrorCode } from "@/shared/error/session";

const invalidTokenError = new TRPCError({
	code: "NOT_FOUND",
	message: SessionErrorCode.INVALID_TOKEN,
});

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
