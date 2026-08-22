import { DomainInput } from "@/server/createDomain";
import { domain_getUserOrThrow } from "@/server/features/user/domain/getUserOrThrow";
import { DomainError } from "@/shared/error/domainError";

const domain_resetPassword = async ({
	ctx,
	input,
}: DomainInput<{
	token: string;
	newPassword: string;
}>) => {
	const resetToken = await ctx.repositories.resetToken.readByToken(input.token);

	if (!resetToken) {
		throw new DomainError("resetToken.not_found");
	}

	if (resetToken.used) {
		throw new DomainError("resetToken.already_used");
	}

	if (resetToken.expiresAt < new Date()) {
		throw new DomainError("resetToken.expired");
	}

	const user = await domain_getUserOrThrow({
		ctx,
		input: { id: resetToken.userId },
	});

	await ctx.repositories.resetToken.update(resetToken.id, {
		used: true,
	});

	const updatedUser = await ctx.repositories.user.update(user.id, {
		password: await ctx.helpers.hashing.hash(input.newPassword),
	});

	return updatedUser;
};

export { domain_resetPassword };
