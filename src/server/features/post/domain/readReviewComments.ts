import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { AppError } from "@/shared/error/appError";
import { ReadReviewCommentsInput } from "../schema";

const domain_readReviewComments = async ({
	ctx,
	input,
}: DomainInput<ReadReviewCommentsInput & { userId: string; role: IRole }>) => {
	const post = await ctx.repositories.post.read(input.postId);

	if (!post) {
		throw new AppError("post.not_found");
	}

	const isOwner = post.userId === input.userId;
	const canReview = ctx.helpers.permissions.can(input.role, "post:publish");

	if (!isOwner && !canReview) {
		throw new AppError("post.update_forbidden");
	}

	return ctx.repositories.reviewComment.readAllByPostId(input.postId);
};

export { domain_readReviewComments };
