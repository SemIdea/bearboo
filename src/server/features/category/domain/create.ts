import { DomainInput } from "@/server/createDomain";
import { CreateCategoryInput } from "../schema";

const domain_createCategory = async ({
	ctx,
	input,
}: DomainInput<CreateCategoryInput>) => {
	const existing = await ctx.repositories.category.readByName(input.name);

	if (existing) return existing;

	const categoryId = ctx.helpers.uid.generate();
	const slug = ctx.helpers.slug.generate(input.name);

	return ctx.repositories.category.create(categoryId, {
		name: input.name,
		slug,
	});
};

export { domain_createCategory };
