import { DomainInput } from "@/server/createDomain";
import { AppError } from "@/shared/error/appError";
import { SubmitForReviewPostInput } from "../schema";

const domain_submitForReviewPost = async ({
	ctx,
	input,
}: DomainInput<SubmitForReviewPostInput & { userId: string }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new AppError("post.not_found");
	}

	if (post.userId !== input.userId) {
		throw new AppError("post.update_forbidden");
	}

	if (post.status !== "DRAFT") {
		throw new AppError("post.invalid_status_transition");
	}

	return ctx.repositories.post.update(input.id, { status: "IN_REVIEW" });
};

export { domain_submitForReviewPost };
