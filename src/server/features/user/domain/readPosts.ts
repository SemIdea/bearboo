import { DomainInput } from "@/server/createDomain";
import { ReadUserPostsInput } from "../schema";
import { domain_getUserOrThrow } from "./getUserOrThrow";

const domain_getUserPosts = async ({
	ctx,
	input,
}: DomainInput<ReadUserPostsInput>) => {
	await domain_getUserOrThrow({ ctx, input: { id: input.id } });

	const posts = await ctx.repositories.post.readUserPosts(input.id);

	return posts;
};

export { domain_getUserPosts };
