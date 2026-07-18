import { revalidateTag } from "next/cache";
import { DomainInput } from "@/server/createDomain";
import { IRole } from "@/server/models/user";
import { CreatePostInput } from "../schema";
import { domain_resolveAvailableSlug } from "./resolveAvailableSlug";

const domain_createPost = async ({
	ctx,
	input,
}: DomainInput<CreatePostInput & { userId: string; role: IRole }>) => {
	const postId = ctx.helpers.uid.generate();
	const baseSlug = ctx.helpers.slug.generate(input.title);
	const slug = await domain_resolveAvailableSlug({ ctx, input: { baseSlug } });
	const canPublishDirectly = ctx.helpers.permissions.can(
		input.role,
		"post:publish",
	);
	const status = canPublishDirectly ? (input.status ?? "PUBLISHED") : "DRAFT";
	const categoryId = input.categoryId ?? null;
	const coverImageUrl = input.coverImageUrl ?? null;

	const post = await ctx.repositories.post.create(postId, {
		title: input.title,
		content: input.content,
		userId: input.userId,
		slug,
		previousSlug: null,
		seoTitle: null,
		seoDescription: null,
		canonicalUrl: null,
		status,
		scheduledAt: null,
		categoryId,
		coverImageUrl,
		viewCount: 0,
	});

	if (input.tagIds?.length) {
		await ctx.repositories.post.setTags(postId, input.tagIds);
	}

	revalidateTag("posts", "hours");

	return post;
};

export { domain_createPost };
