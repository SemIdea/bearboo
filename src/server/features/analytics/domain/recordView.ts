import { DomainInput } from "@/server/createDomain";
import { DomainError } from "@/shared/error/domainError";

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

	if (!post) {
		throw new DomainError("post.not_found");
	}

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
