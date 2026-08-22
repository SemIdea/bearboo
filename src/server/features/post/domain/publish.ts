import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { DomainError } from "@/shared/error/domainError";
import { PublishPostInput } from "../schema";

const VALID_SOURCE_STATUSES = ["DRAFT", "IN_REVIEW"];

const domain_publishPost = async ({
	ctx,
	input,
}: DomainInput<PublishPostInput & { role: IRole; reviewerId: string }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new DomainError("post.not_found");
	}

	if (!ctx.helpers.permissions.can(input.role, "post:publish")) {
		throw new DomainError("post.update_forbidden");
	}

	if (!VALID_SOURCE_STATUSES.includes(post.status)) {
		throw new DomainError("post.invalid_status_transition");
	}

	const isScheduledForFuture =
		!!input.scheduledAt && input.scheduledAt.getTime() > Date.now();

	const updated = await ctx.repositories.post.update(input.id, {
		status: isScheduledForFuture ? "SCHEDULED" : "PUBLISHED",
		scheduledAt: isScheduledForFuture ? input.scheduledAt : null,
	});

	if (post.status === "IN_REVIEW" && input.comment) {
		const commentId = ctx.helpers.uid.generate();

		await ctx.repositories.reviewComment.create(commentId, {
			postId: post.id,
			reviewerId: input.reviewerId,
			type: "APPROVAL",
			content: input.comment,
		});
	}

	revalidateTag("posts", "hours");

	return updated;
};

export { domain_publishPost };
