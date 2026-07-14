import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { PostErrorCode } from "@/shared/error/post";
import { ReadReviewCommentsInput } from "../schema";

const domain_readReviewComments = async ({
	ctx,
	input,
}: DomainInput<ReadReviewCommentsInput & { userId: string; role: IRole }>) => {
	const post = await ctx.repositories.post.read(input.postId);

	if (!post) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: PostErrorCode.POST_NOT_FOUND,
		});
	}

	const isOwner = post.userId === input.userId;
	const canReview = ctx.helpers.permissions.can(input.role, "post:publish");

	if (!isOwner && !canReview) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: PostErrorCode.POST_UPDATE_FORBIDDEN,
		});
	}

	return ctx.repositories.reviewComment.readAllByPostId(input.postId);
};

export { domain_readReviewComments };
