import { DomainInput } from "@/server/createDomain";
import { SearchPostsInput } from "../schema";

const DEFAULT_PAGE_SIZE = 10;

const domain_searchPosts = async ({
	ctx,
	input,
}: DomainInput<SearchPostsInput>) => {
	const limit = input.limit ?? DEFAULT_PAGE_SIZE;

	const fetched = await ctx.repositories.post.search(
		input.query,
		limit + 1,
		input.cursor,
		input.categoryId,
		input.tagId,
		input.sortBy,
	);

	const hasNextPage = fetched.length > limit;
	const posts = hasNextPage ? fetched.slice(0, limit) : fetched;
	const nextCursor = hasNextPage ? posts[posts.length - 1].id : null;

	return { posts, nextCursor };
};

export { domain_searchPosts };
