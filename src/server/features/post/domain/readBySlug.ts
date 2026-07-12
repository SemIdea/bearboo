import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { ReadPostBySlugInput } from "../schema";

const domain_readPostBySlug = async ({
	ctx,
	input,
}: DomainInput<ReadPostBySlugInput>) => {
	const post = await ctx.repositories.post.readBySlug(input.slug);

	if (!post) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: PostErrorCode.POST_NOT_FOUND,
		});
	}

	return post;
};

export { domain_readPostBySlug };
