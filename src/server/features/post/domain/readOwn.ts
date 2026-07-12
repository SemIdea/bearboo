import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { ReadOwnPostsInput } from "../schema";

const domain_readOwnPosts = async ({
	ctx,
	input,
}: DomainInput<ReadOwnPostsInput & { userId: string; role: IRole }>) => {
	const canReadAny = ctx.helpers.permissions.can(input.role, "post:editAny");

	return ctx.repositories.post.readOwnPosts(
		canReadAny ? null : input.userId,
		input.status,
		input.categoryId,
		input.tagId,
	);
};

export { domain_readOwnPosts };
