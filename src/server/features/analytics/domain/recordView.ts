import { DomainInput } from "@/server/createDomain";

const domain_recordView = async ({
	ctx,
	input,
}: DomainInput<{
	postId: string;
	visitorId: string;
	referer?: string | null;
	userAgent?: string | null;
}>) => {
	const post = await ctx.repositories.post.readIfPubliclyVisible(input.postId);

	if (!post) return null;

	const referrerBucket = ctx.helpers.referrerClassifier.classify(input.referer);

	try {
		return await ctx.gateways.viewCounter.recordView(
			input.postId,
			input.visitorId,
			{ referrerBucket, userAgent: input.userAgent ?? "" },
		);
	} catch {
		return { counted: false };
	}
};

export { domain_recordView };
