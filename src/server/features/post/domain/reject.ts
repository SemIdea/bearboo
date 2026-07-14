import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { PostErrorCode } from "@/shared/error/post";
import { RejectPostInput } from "../schema";

const domain_rejectPost = async ({
	ctx,
	input,
}: DomainInput<RejectPostInput & { role: IRole; reviewerId: string }>) => {
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

	if (post.status !== "IN_REVIEW") {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: PostErrorCode.POST_INVALID_STATUS_TRANSITION,
		});
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
