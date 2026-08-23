import { DomainInput } from "@/server/createDomain";
import { domain_getUserOrThrow } from "@/server/features/user/domain/getUserOrThrow";
import { AppError } from "@/shared/error/appError";

const domain_resetPassword = async ({
	ctx,
	input,
}: DomainInput<{
	token: string;
	newPassword: string;
}>) => {
	const resetToken = await ctx.repositories.resetToken.readByToken(input.token);

	if (!resetToken) {
		throw new AppError("resetToken.not_found");
	}

	if (resetToken.used) {
		throw new AppError("resetToken.already_used");
	}

	if (resetToken.expiresAt < new Date()) {
		throw new AppError("resetToken.expired");
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
