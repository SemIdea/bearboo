import { DomainInput } from "@/server/createDomain";
import { ReadOwnPostsInput } from "../schema";

const domain_readOwnPosts = async ({
	ctx,
	input,
}: DomainInput<ReadOwnPostsInput & { userId: string }>) => {
	return ctx.repositories.post.readOwnPosts(
		input.userId,
		input.status,
		input.categoryId,
		input.tagId,
	);
};

export { domain_readOwnPosts };
