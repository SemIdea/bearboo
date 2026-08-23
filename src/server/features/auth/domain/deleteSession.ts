import { DomainInput } from "@/server/createDomain";
import { domain_getUserOrThrow } from "@/server/features/user/domain/getUserOrThrow";
import { AppError } from "@/shared/error/appError";

const domain_deleteSession = async ({
	ctx,
	input,
}: DomainInput<{ id: string; userId: string }>) => {
	await domain_getUserOrThrow({ ctx, input: { id: input.userId } });

	const session = await ctx.repositories.session.read(input.id);

	if (!session) {
		throw new AppError("session.session_not_found");
	}

	await ctx.repositories.session.delete(session.id);
};

export { domain_deleteSession };
