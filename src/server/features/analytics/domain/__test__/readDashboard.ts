import { describe, expect, test, vi } from "vitest";
import { createTestContext } from "@/test/context";
import { domain_readDashboard } from "../readDashboard";
import { domain_recordView } from "../recordView";

const CHROME_UA =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

describe("domain_readDashboard", () => {
	test("returns the total accumulated views across posts", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const postA = await ctx.createPost({
			userId: user.id,
			status: "PUBLISHED",
		});
		const postB = await ctx.createPost({
			userId: user.id,
			status: "PUBLISHED",
		});

		await domain_recordView({
			ctx,
			input: { postId: postA.id, visitorId: "v1" },
		});
		await domain_recordView({
			ctx,
			input: { postId: postA.id, visitorId: "v2" },
		});
		await domain_recordView({
			ctx,
			input: { postId: postB.id, visitorId: "v1" },
		});

		const dashboard = await domain_readDashboard({ ctx, input: {} });

		expect(dashboard.totalViews).toBe(3);
	});

	test("lists posts ordered by view count, most viewed first", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const popular = await ctx.createPost({
			userId: user.id,
			status: "PUBLISHED",
		});
		const quiet = await ctx.createPost({
			userId: user.id,
			status: "PUBLISHED",
		});

		await domain_recordView({
			ctx,
			input: { postId: popular.id, visitorId: "v1" },
		});
		await domain_recordView({
			ctx,
			input: { postId: popular.id, visitorId: "v2" },
		});
		await domain_recordView({
			ctx,
			input: { postId: quiet.id, visitorId: "v1" },
		});

		const dashboard = await domain_readDashboard({ ctx, input: {} });

		expect(dashboard.posts[0]).toMatchObject({ id: popular.id, viewCount: 2 });
		expect(dashboard.posts[1]).toMatchObject({ id: quiet.id, viewCount: 1 });
	});

	test("persists buffered events, purges events older than 30 days, and returns period/origin/browser breakdowns", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({
			userId: user.id,
			status: "PUBLISHED",
		});
		const deleteOlderThanSpy = vi.spyOn(
			ctx.repositories.postView,
			"deleteOlderThan",
		);

		await domain_recordView({
			ctx,
			input: {
				postId: post.id,
				visitorId: "visitor-1",
				referer: "https://www.google.com/search?q=x",
				userAgent: CHROME_UA,
			},
		});
		await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-2" },
		});

		const dashboard = await domain_readDashboard({ ctx, input: {} });

		expect(deleteOlderThanSpy).toHaveBeenCalledWith(30);
		expect(dashboard.viewsLast7Days).toBe(2);
		expect(dashboard.viewsLast30Days).toBe(2);
		expect(dashboard.trafficOrigin).toEqual(
			expect.arrayContaining([
				{ bucket: "SEARCH", count: 1 },
				{ bucket: "DIRECT", count: 1 },
			]),
		);
		expect(dashboard.browsers).toEqual(
			expect.arrayContaining([
				{ name: "Chrome", count: 1 },
				{ name: "Unknown", count: 1 },
			]),
		);
	});

	test("does not persist an event for a view that was not newly counted (duplicate visitor)", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({
			userId: user.id,
			status: "PUBLISHED",
		});

		await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-1" },
		});
		await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-1" },
		});

		const dashboard = await domain_readDashboard({ ctx, input: {} });

		expect(dashboard.viewsLast30Days).toBe(1);
	});
});
