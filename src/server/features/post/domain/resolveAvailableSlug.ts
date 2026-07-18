import { DomainInput } from "@/server/createDomain";

const domain_resolveAvailableSlug = async ({
	ctx,
	input,
}: DomainInput<{
	baseSlug: string;
	excludePostId?: string;
}>): Promise<string> => {
	let candidate = input.baseSlug;
	let suffix = 1;

	while (true) {
		const existing = await ctx.repositories.post.readBySlug(candidate);

		if (!existing || existing.id === input.excludePostId) {
			return candidate;
		}

		suffix += 1;
		candidate = `${input.baseSlug}-${suffix}`;
	}
};

export { domain_resolveAvailableSlug };
