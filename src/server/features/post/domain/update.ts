import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { PostErrorCode } from "@/shared/error/post";
import { UpdatePostInput } from "../schema";

const domain_updatePost = async ({
	ctx,
	input,
}: DomainInput<UpdatePostInput & { userId: string; role: IRole }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: PostErrorCode.POST_NOT_FOUND,
		});
	}

	const isOwner = post.userId === input.userId;
	const canEditAny = ctx.helpers.permissions.can(input.role, "post:editAny");

	if (!isOwner && !canEditAny) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: PostErrorCode.POST_UPDATE_FORBIDDEN,
		});
	}

	const updated = await ctx.repositories.post.update(input.id, {
		title: input.title,
		content: input.content,
		status: input.status,
		categoryId: input.categoryId,
		coverImageUrl: input.coverImageUrl,
	});

	if (input.tagIds) {
		await ctx.repositories.post.setTags(input.id, input.tagIds);
	}

	return updated;
};

export { domain_updatePost };
