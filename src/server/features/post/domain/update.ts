import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { DomainError } from "@/shared/error/domainError";
import { UpdatePostInput } from "../schema";
import { domain_resolveAvailableSlug } from "./resolveAvailableSlug";

const normalizeOverride = (
	value: string | undefined,
): string | null | undefined =>
	value === undefined ? undefined : value === "" ? null : value;

const domain_updatePost = async ({
	ctx,
	input,
}: DomainInput<UpdatePostInput & { userId: string; role: IRole }>) => {
	const post = await ctx.repositories.post.read(input.id);

	if (!post) {
		throw new DomainError("post.not_found");
	}

	const isOwner = post.userId === input.userId;
	const canEditAny = ctx.helpers.permissions.can(input.role, "post:editAny");

	if (!isOwner && !canEditAny) {
		throw new DomainError("post.update_forbidden");
	}

	let slug: string | undefined;
	let previousSlug: string | undefined;

	if (input.slug && input.slug !== post.slug) {
		slug = await domain_resolveAvailableSlug({
			ctx,
			input: { baseSlug: input.slug, excludePostId: post.id },
		});
		previousSlug = post.slug;
	}

	const updated = await ctx.repositories.post.update(input.id, {
		title: input.title,
		content: input.content,
		categoryId: input.categoryId,
		coverImageUrl: input.coverImageUrl,
		slug,
		previousSlug,
		seoTitle: normalizeOverride(input.seoTitle),
		seoDescription: normalizeOverride(input.seoDescription),
		canonicalUrl: normalizeOverride(input.canonicalUrl),
	});

	if (input.tagIds) {
		await ctx.repositories.post.setTags(input.id, input.tagIds);
	}

	return updated;
};

export { domain_updatePost };
