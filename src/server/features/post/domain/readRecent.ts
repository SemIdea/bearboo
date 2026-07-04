import { DomainInput } from "@/server/createDomain";

const domain_readRecentPosts = async ({ ctx }: DomainInput) => {
	const posts = await ctx.repositories.post.readRecents(30);

	return posts;
};

export { domain_readRecentPosts };
