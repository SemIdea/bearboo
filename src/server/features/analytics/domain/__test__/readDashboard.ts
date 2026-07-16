import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { domain_readDashboard } from "../readDashboard";
import { domain_recordView } from "../recordView";

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
});
