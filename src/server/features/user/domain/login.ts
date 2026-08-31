import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";
import { LoginUserInput } from "../schema";

// Bcrypt hash of a fixed placeholder password (cost 10, same as real hashes) —
// compared against when the email doesn't exist so a mismatch takes the same
// time either way (closes the timing side-channel, not just the message one).
const DUMMY_PASSWORD_HASH =
	"$2b$10$AySv8oQBUMv5OOodr543Z.9Q6WKQWso237RtvWEyWweL2dao05rzS";

const invalidCredentialsError = new AppError("auth.invalid_credentials");

const domain_loginUser = async ({
	ctx,
	input,
}: DomainInput<LoginUserInput>) => {
	const user = await ctx.repositories.user.readByEmail(input.email);

	const isSamePassword = await ctx.helpers.hashing.compare(
		input.password,
		user?.password ?? DUMMY_PASSWORD_HASH,
	);

	if (!user || !isSamePassword) {
		throw invalidCredentialsError;
	}

	return user;
};

export { domain_loginUser };
