import { DomainInput } from "@/server/createDomain";
import { CreateTagInput } from "../schema";

const domain_createTag = async ({
	ctx,
	input,
}: DomainInput<CreateTagInput>) => {
	const existing = await ctx.repositories.tag.readByName(input.name);

	if (existing) return existing;

	const tagId = ctx.helpers.uid.generate();
	const slug = ctx.helpers.slug.generate(input.name);

	return ctx.repositories.tag.create(tagId, { name: input.name, slug });
};

export { domain_createTag };
