import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";
import { SubmitForReviewPostInput } from "../schema";

const domain_submitForReviewPost = async ({
	ctx,
	input,
}: DomainInput<SubmitForReviewPostInput & { userId: string }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new DomainError("post.not_found");
	}

	if (post.userId !== input.userId) {
		throw new DomainError("post.update_forbidden");
	}

	if (post.status !== "DRAFT") {
		throw new DomainError("post.invalid_status_transition");
	}

	return ctx.repositories.post.update(input.id, { status: "IN_REVIEW" });
};

export { domain_submitForReviewPost };
