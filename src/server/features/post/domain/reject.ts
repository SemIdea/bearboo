import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { AppError } from "@/shared/error/appError";
import { RejectPostInput } from "../schema";

const domain_rejectPost = async ({
	ctx,
	input,
}: DomainInput<RejectPostInput & { role: IRole; reviewerId: string }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new AppError("post.not_found");
	}

	if (!ctx.helpers.permissions.can(input.role, "post:publish")) {
		throw new AppError("post.update_forbidden");
	}

	if (post.status !== "IN_REVIEW") {
		throw new AppError("post.invalid_status_transition");
	}

	const updated = await ctx.repositories.post.update(input.id, {
		status: "DRAFT",
	});

	const commentId = ctx.helpers.uid.generate();

	await ctx.repositories.reviewComment.create(commentId, {
		postId: post.id,
		reviewerId: input.reviewerId,
		type: "REJECTION",
		content: input.comment,
	});

	return updated;
};

export { domain_rejectPost };
