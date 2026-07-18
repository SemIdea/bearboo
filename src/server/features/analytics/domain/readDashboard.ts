import { DomainInput } from "@/server/createDomain";
import {
	DASHBOARD_MOST_VIEWED_LIMIT,
	DASHBOARD_TREND_WINDOW_DAYS,
	VIEW_EVENT_RETENTION_DAYS,
} from "../constants";

const domain_readDashboard = async ({ ctx }: DomainInput<{}>) => {
	const [deltas, events] = await Promise.all([
		ctx.gateways.viewCounter.drainPendingCounts(),
		ctx.gateways.viewCounter.drainPendingEvents(),
	]);

	if (Object.keys(deltas).length > 0) {
		await ctx.repositories.post.applyViewIncrements(deltas);
	}

	const eventRows = Object.entries(events).flatMap(([postId, postEvents]) =>
		postEvents.map((event) => ({ postId, ...event })),
	);

	await Promise.all(
		eventRows.map((row) =>
			ctx.repositories.postView.create(ctx.helpers.uid.generate(), row),
		),
	);

	await ctx.repositories.postView.deleteOlderThan(VIEW_EVENT_RETENTION_DAYS);

	const [posts, totalViews, viewsLast7Days, viewsLast30Days, trafficOrigin, userAgents] =
		await Promise.all([
			ctx.repositories.post.readMostViewed(DASHBOARD_MOST_VIEWED_LIMIT),
			ctx.repositories.post.readTotalViews(),
			ctx.repositories.postView.countSince(DASHBOARD_TREND_WINDOW_DAYS.last7),
			ctx.repositories.postView.countSince(DASHBOARD_TREND_WINDOW_DAYS.last30),
			ctx.repositories.postView.readReferrerBreakdown(
				DASHBOARD_TREND_WINDOW_DAYS.last30,
			),
			ctx.repositories.postView.readUserAgents(
				DASHBOARD_TREND_WINDOW_DAYS.last30,
			),
		]);

	const browserCounts = new Map<string, number>();

	for (const userAgent of userAgents) {
		const { browser } = ctx.helpers.userAgentClassifier.classify(userAgent);
		browserCounts.set(browser, (browserCounts.get(browser) ?? 0) + 1);
	}

	const browsers = Array.from(browserCounts, ([name, count]) => ({
		name,
		count,
	}));

	return {
		totalViews,
		posts,
		viewsLast7Days,
		viewsLast30Days,
		trafficOrigin,
		browsers,
	};
};

export { domain_readDashboard };
