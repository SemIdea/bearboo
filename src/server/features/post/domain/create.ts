import { IBaseContextDTO } from "@/server/createContext";
import { DomainInput } from "@/server/createDomain";
import { CreatePostInput } from "../schema";

const resolveAvailableSlug = async (
	ctx: IBaseContextDTO,
	baseSlug: string,
): Promise<string> => {
	let candidate = baseSlug;
	let suffix = 1;

	while (await ctx.repositories.post.readBySlug(candidate)) {
		suffix += 1;
		candidate = `${baseSlug}-${suffix}`;
	}

	return candidate;
};

const domain_createPost = async ({
	ctx,
	input,
}: DomainInput<CreatePostInput & { userId: string }>) => {
	const postId = ctx.helpers.uid.generate();
	const baseSlug = ctx.helpers.slug.generate(input.title);
	const slug = await resolveAvailableSlug(ctx, baseSlug);
	const status = input.status ?? "PUBLISHED";
	const categoryId = input.categoryId ?? null;
	const coverImageUrl = input.coverImageUrl ?? null;

	const post = await ctx.repositories.post.create(postId, {
		title: input.title,
		content: input.content,
		userId: input.userId,
		slug,
		status,
		categoryId,
		coverImageUrl,
	});

	if (input.tagIds?.length) {
		await ctx.repositories.post.setTags(postId, input.tagIds);
	}

	return post;
};

export { domain_createPost };
