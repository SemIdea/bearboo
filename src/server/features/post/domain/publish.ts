import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { PostErrorCode } from "@/shared/error/post";
import { PublishPostInput } from "../schema";

const VALID_SOURCE_STATUSES = ["DRAFT", "IN_REVIEW"];

const domain_publishPost = async ({
	ctx,
	input,
}: DomainInput<PublishPostInput & { role: IRole; reviewerId: string }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: PostErrorCode.POST_NOT_FOUND,
		});
	}

	if (!ctx.helpers.permissions.can(input.role, "post:publish")) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: PostErrorCode.POST_UPDATE_FORBIDDEN,
		});
	}

	if (!VALID_SOURCE_STATUSES.includes(post.status)) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: PostErrorCode.POST_INVALID_STATUS_TRANSITION,
		});
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
