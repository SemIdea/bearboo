import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";
import { CreateUserInput } from "../schema";

const domain_registerUser = async ({
	ctx,
	input,
}: DomainInput<CreateUserInput>) => {
	const existingUser = await ctx.repositories.user.readByEmail(input.email);

	if (existingUser) {
		throw new AppError("user.already_exists");
	}

	const userId = ctx.helpers.uid.generate();
	const hashedPassword = await ctx.helpers.hashing.hash(input.password);

	const user = await ctx.repositories.user.create(userId, {
		...input,
		password: hashedPassword,
		verified: false,
		role: "AUTHOR",
	});

	return user;
};

export { domain_registerUser };
