import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { domain_getUserOrThrow } from "@/server/features/user/domain/getUserOrThrow";
import { SessionErrorCode } from "@/shared/error/session";

const domain_deleteSession = async ({
	ctx,
	input,
}: DomainInput<{ id: string; userId: string }>) => {
	await domain_getUserOrThrow({ ctx, input: { id: input.userId } });

	const session = await ctx.repositories.session.read(input.id);

	if (!session) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: SessionErrorCode.SESSION_NOT_FOUND,
		});
	}

	await ctx.repositories.session.delete(session.id);
};

export { domain_deleteSession };
