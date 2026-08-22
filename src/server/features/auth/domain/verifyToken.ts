import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";
import { VerifyTokenInput } from "../schema";

const domain_verifyToken = async ({
	ctx,
	input,
}: DomainInput<VerifyTokenInput>) => {
	const verifyToken = await ctx.repositories.verifyToken.readByToken(
		input.token,
	);

	if (!verifyToken) {
		throw new DomainError("verifyToken.not_found");
	}

	if (verifyToken.used) {
		throw new DomainError("verifyToken.already_used");
	}

	if (verifyToken.expiresAt < new Date()) {
		throw new DomainError("verifyToken.expired");
	}

	await ctx.repositories.user.update(verifyToken.userId, {
		verified: true,
	});

	const verifiedToken = await ctx.repositories.verifyToken.update(
		verifyToken.id,
		{
			used: true,
		},
	);

	return verifiedToken;
};

export { domain_verifyToken };
