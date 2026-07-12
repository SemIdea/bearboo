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

	return ctx.repositories.post.create(postId, { ...input, slug });
};

export { domain_createPost };
