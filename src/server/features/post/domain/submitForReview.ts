import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { SubmitForReviewPostInput } from "../schema";

const domain_submitForReviewPost = async ({
	ctx,
	input,
}: DomainInput<SubmitForReviewPostInput & { userId: string }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: PostErrorCode.POST_NOT_FOUND,
		});
	}

	if (post.userId !== input.userId) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: PostErrorCode.POST_UPDATE_FORBIDDEN,
		});
	}

	if (post.status !== "DRAFT") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: PostErrorCode.POST_INVALID_STATUS_TRANSITION,
		});
	}

	return ctx.repositories.post.update(input.id, { status: "IN_REVIEW" });
};

export { domain_submitForReviewPost };
