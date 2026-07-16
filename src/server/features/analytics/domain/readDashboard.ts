import { DomainInput } from "@/server/createDomain";

const DASHBOARD_MOST_VIEWED_LIMIT = 20;

const domain_readDashboard = async ({ ctx }: DomainInput<{}>) => {
	const deltas = await ctx.gateways.viewCounter.drainPendingCounts();

	if (Object.keys(deltas).length > 0) {
		await ctx.repositories.post.applyViewIncrements(deltas);
	}

	const [posts, totalViews] = await Promise.all([
		ctx.repositories.post.readMostViewed(DASHBOARD_MOST_VIEWED_LIMIT),
		ctx.repositories.post.readTotalViews(),
	]);

	return { totalViews, posts };
};

export { domain_readDashboard };
