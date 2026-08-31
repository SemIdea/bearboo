import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";

const domain_getUserByEmailOrThrow = async ({
	ctx,
	input,
}: DomainInput<{ email: string }>) => {
	const user = await ctx.repositories.user.readByEmail(input.email);

	if (!user) {
		throw new AppError("user.not_found");
	}

	return user;
};

export { domain_getUserByEmailOrThrow };
