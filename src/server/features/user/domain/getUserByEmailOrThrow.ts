import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";

const domain_getUserByEmailOrThrow = async ({
	ctx,
	input,
}: DomainInput<{ email: string }>) => {
	const user = await ctx.repositories.user.readByEmail(input.email);

	if (!user) {
		throw new DomainError("user.not_found");
	}

	return user;
};

export { domain_getUserByEmailOrThrow };
