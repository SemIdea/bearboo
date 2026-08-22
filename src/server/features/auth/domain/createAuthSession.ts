import { DomainInput } from "@/server/createDomain";
import { domain_getUserOrThrow } from "@/server/features/user/domain/getUserOrThrow";
import { DomainError } from "@/shared/error/domainError";

const domain_createAuthSession = async ({
	ctx,
	input,
}: DomainInput<{ userId: string }>) => {
	const user = await domain_getUserOrThrow({
		ctx,
		input: { id: input.userId },
	});

	const sessionId = ctx.helpers.uid.generate();
	const accessToken = ctx.helpers.uid.generate();
	const refreshToken = ctx.helpers.uid.generate();

	const session = await ctx.repositories.session.create(sessionId, {
		userId: user.id,
		accessToken,
		refreshToken,
	});

	if (!session) {
		throw new DomainError("session.session_create_error");
	}

	return session;
};

export { domain_createAuthSession };
