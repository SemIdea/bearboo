import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";

const domain_getUserOrThrow = async ({
	ctx,
	input,
}: DomainInput<{ id: string }>) => {
	const user = await ctx.repositories.user.read(input.id);

	if (!user) {
		throw new DomainError("user.not_found");
	}

	return user;
};

export { domain_getUserOrThrow };
