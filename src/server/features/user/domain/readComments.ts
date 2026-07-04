import { DomainInput } from "@/server/createDomain";
import { ReadUserCommentsInput } from "../schema";
import { domain_getUserOrThrow } from "./getUserOrThrow";

const domain_readUserComments = async ({
	ctx,
	input,
}: DomainInput<ReadUserCommentsInput>) => {
	await domain_getUserOrThrow({ ctx, input: { id: input.id } });

	const comments = await ctx.repositories.comment.readAllByUserId(input.id);

	return comments ?? [];
};

export { domain_readUserComments };
