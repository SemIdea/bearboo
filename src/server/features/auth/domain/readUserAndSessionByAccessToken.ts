import { DomainInput } from "@/server/createDomain";
import { IUserWithSession } from "@/server/models/user";
import { AppError } from "@/shared/error/appError";

const domain_readUserAndSessionByAccessToken = async ({
	ctx,
	input,
}: DomainInput<{ accessToken: string }>) => {
	const session = await ctx.repositories.session.readByAccessToken(
		input.accessToken,
	);

	if (!session || !session.userId) {
		throw new AppError("session.access_token_invalid");
	}

	const user = await ctx.repositories.user.read(session.userId);

	if (!user) {
		throw new AppError("session.access_token_invalid");
	}

	return {
		id: user.id,
		name: user.name,
		email: user.email,
		verified: user.verified,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		bio: user.bio,
		session: {
			id: session.id,
			accessToken: session.accessToken,
			refreshToken: session.refreshToken,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
		},
	} as IUserWithSession;
};

export { domain_readUserAndSessionByAccessToken };
