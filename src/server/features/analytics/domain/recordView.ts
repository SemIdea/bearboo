import { DomainInput } from "@/server/createDomain";

const domain_recordView = async ({
	ctx,
	input,
}: DomainInput<{ postId: string; visitorId: string }>) => {
	const post = await ctx.repositories.post.readIfPubliclyVisible(input.postId);

	if (!post) return null;

	try {
		return await ctx.gateways.viewCounter.recordView(
			input.postId,
			input.visitorId,
		);
	} catch {
		return { counted: false };
	}
};

export { domain_recordView };
