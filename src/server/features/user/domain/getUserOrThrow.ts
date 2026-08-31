import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";

const domain_getUserOrThrow = async ({
	ctx,
	input,
}: DomainInput<{ id: string }>) => {
	const user = await ctx.repositories.user.read(input.id);

	if (!user) {
		throw new AppError("user.not_found");
	}

	return user;
};

export { domain_getUserOrThrow };
