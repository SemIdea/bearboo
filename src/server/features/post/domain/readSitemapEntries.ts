import { DomainInput } from "@/server/createDomain";

const domain_readSitemapEntries = async ({ ctx }: DomainInput) =>
	ctx.repositories.post.readAllPublicSlugs();

export { domain_readSitemapEntries };
