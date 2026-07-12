import { DomainInput } from "@/server/createDomain";

const domain_readAllTags = async ({ ctx }: DomainInput) =>
	ctx.repositories.tag.readAll();

export { domain_readAllTags };
