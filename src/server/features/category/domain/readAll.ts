import { DomainInput } from "@/server/createDomain";

const domain_readAllCategories = async ({ ctx }: DomainInput) =>
	ctx.repositories.category.readAll();

export { domain_readAllCategories };
