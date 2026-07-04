import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { ReadPostInput } from "../schema";

const domain_readPost = async ({ ctx, input }: DomainInput<ReadPostInput>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: PostErrorCode.POST_NOT_FOUND,
		});
	}

	return post;
};

export { domain_readPost };
