import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";

const domain_getUserByEmailOrThrow = async ({
	ctx,
	input,
}: DomainInput<{ email: string }>) => {
	const user = await ctx.repositories.user.readByEmail(input.email);

	if (!user) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: UserErrorCode.USER_NOT_FOUND,
		});
	}

	return user;
};

export { domain_getUserByEmailOrThrow };
