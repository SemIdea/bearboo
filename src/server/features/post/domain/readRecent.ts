import { DomainInput } from "@/server/createDomain";
import { ReadRecentPostsInput } from "../schema";

const DEFAULT_PAGE_SIZE = 10;

const domain_readRecentPosts = async ({
	ctx,
	input,
}: DomainInput<ReadRecentPostsInput>) => {
	const limit = input.limit ?? DEFAULT_PAGE_SIZE;

	const fetched = await ctx.repositories.post.readRecents(
		limit + 1,
		input.cursor,
	);

	const hasNextPage = fetched.length > limit;
	const posts = hasNextPage ? fetched.slice(0, limit) : fetched;
	const nextCursor = hasNextPage ? posts[posts.length - 1].id : null;

	return { posts, nextCursor };
};

export { domain_readRecentPosts };
