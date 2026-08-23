import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { AppError } from "@/shared/error/appError";
import { ReadPostBySlugInput } from "../schema";

const isPubliclyVisible = (post: {
	status: string;
	scheduledAt: Date | null;
}) =>
	post.status === "PUBLISHED" ||
	(post.status === "SCHEDULED" &&
		!!post.scheduledAt &&
		post.scheduledAt.getTime() <= Date.now());

const domain_readPostBySlug = async ({
	ctx,
	input,
}: DomainInput<ReadPostBySlugInput & { callerId?: string; role?: IRole }>) => {
	const post = await ctx.repositories.post.readBySlug(input.slug);

	if (!post) {
		throw new AppError("post.not_found");
	}

	const isOwner = post.userId === input.callerId;
	const canReview =
		!!input.role && ctx.helpers.permissions.can(input.role, "post:publish");

	if (!isPubliclyVisible(post) && !isOwner && !canReview) {
		throw new AppError("post.not_found");
	}

	return post;
};

export { domain_readPostBySlug };
