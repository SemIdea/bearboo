import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { AnalyticsRouter } from "../../index";

describe("Analytics recordView Controller Unitary Testing", () => {
	test("Should record a view and set a visitorId cookie when none is present", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "PUBLISHED" });

		const result = await AnalyticsRouter.createCaller(ctx).recordView({
			postId: post.id,
		});

		expect(result).toEqual({ counted: true });
		expect(ctx.resCookies.pending).toEqual([
			expect.objectContaining({ name: "visitorId" }),
		]);
	});

	test("Should reuse the existing visitorId cookie instead of setting a new one", async () => {
		const ctx = createTestContext();
		ctx.visitorId = "returning-visitor";
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "PUBLISHED" });

		await AnalyticsRouter.createCaller(ctx).recordView({ postId: post.id });

		expect(ctx.resCookies.pending).toEqual([]);
	});

	test("Should reject recording a view for a post that does not exist", async () => {
		const ctx = createTestContext();

		await expect(
			AnalyticsRouter.createCaller(ctx).recordView({ postId: "missing-post" }),
		).rejects.toMatchObject({ code: "NOT_FOUND", message: "Post not found." });
	});

	test("Should classify the Referer/User-Agent headers and forward them to the domain layer", async () => {
		const ctx = createTestContext();
		ctx.headers = new Headers({
			referer: "https://www.google.com/search?q=x",
			"user-agent": "some-agent",
		});
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "PUBLISHED" });

		await AnalyticsRouter.createCaller(ctx).recordView({ postId: post.id });

		const events = await ctx.gateways.viewCounter.drainPendingEvents();

		expect(events[post.id]).toEqual([
			{ referrerBucket: "SEARCH", userAgent: "some-agent" },
		]);
	});
});
