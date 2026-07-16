import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { PostErrorCode } from "@/shared/error/post";
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
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			}),
		);
	});
});
