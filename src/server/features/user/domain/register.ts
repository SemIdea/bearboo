import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { CreateUserInput } from "../schema";

const domain_registerUser = async ({
	ctx,
	input,
}: DomainInput<CreateUserInput>) => {
	const existingUser = await ctx.repositories.user.readByEmail(input.email);

	if (existingUser) {
		throw new TRPCError({
			code: "CONFLICT",
			message: UserErrorCode.USER_ALREADY_EXISTS,
		});
	}

	const userId = ctx.helpers.uid.generate();
	const hashedPassword = await ctx.helpers.hashing.hash(input.password);

	const user = await ctx.repositories.user.create(userId, {
		...input,
		password: hashedPassword,
		verified: false,
	});

	return user;
};

export { domain_registerUser };
