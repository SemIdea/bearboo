import { DomainInput } from "@/server/createDomain";
import { ReadRedirectSlugInput } from "../schema";

const domain_readRedirectSlug = async ({
	ctx,
	input,
}: DomainInput<ReadRedirectSlugInput>): Promise<{ slug: string } | null> =>
	ctx.repositories.post.readByPreviousSlug(input.slug);

export { domain_readRedirectSlug };
