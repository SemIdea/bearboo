import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";
import { ReadPostInput } from "../schema";

const domain_readPost = async ({ ctx, input }: DomainInput<ReadPostInput>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new DomainError("post.not_found");
	}

	return post;
};

export { domain_readPost };
