import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";
import { RevalidatePostInput } from "../schema";

const domain_revalidatePost = async ({
	ctx,
	input,
}: DomainInput<RevalidatePostInput & { userId: string }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new DomainError("post.not_found");
	}

	if (post.userId !== input.userId) {
		throw new DomainError("post.update_forbidden");
	}

	revalidateTag("posts", "hours");

	return post;
};

export { domain_revalidatePost };
