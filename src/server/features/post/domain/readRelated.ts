import { DomainInput } from "@/server/createDomain";
import { ReadRelatedPostsInput } from "../schema";

const DEFAULT_RELATED_LIMIT = 5;

const domain_readRelatedPosts = async ({
	ctx,
	input,
}: DomainInput<ReadRelatedPostsInput>) => {
	const limit = input.limit ?? DEFAULT_RELATED_LIMIT;

	return ctx.repositories.post.readRelated(
		input.postId,
		input.categoryId ?? null,
		input.tagIds ?? [],
		limit,
	);
};

export { domain_readRelatedPosts };
