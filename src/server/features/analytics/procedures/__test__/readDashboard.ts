import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { AuthErrorCode } from "@/shared/error/auth";
import { createAuthenticatedContext } from "@/test/context";
import { AnalyticsRouter } from "../../index";

describe("Analytics readDashboard Controller Unitary Testing", () => {
	test("Should reject an author trying to read the dashboard", async () => {
		const authorCtx = await createAuthenticatedContext({ role: "AUTHOR" });

		await expect(
			AnalyticsRouter.createCaller(authorCtx).readDashboard(),
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: AuthErrorCode.INSUFFICIENT_ROLE,
			}),
		);
	});

	test("Should let an editor read the dashboard", async () => {
		const editorCtx = await createAuthenticatedContext({ role: "EDITOR" });

		const result =
			await AnalyticsRouter.createCaller(editorCtx).readDashboard();

		expect(result).toEqual({
			totalViews: 0,
			posts: [],
			viewsLast7Days: 0,
			viewsLast30Days: 0,
			trafficOrigin: [],
			browsers: [],
		});
	});

	test("Should let an admin read the dashboard", async () => {
		const adminCtx = await createAuthenticatedContext({ role: "ADMIN" });

		const result = await AnalyticsRouter.createCaller(adminCtx).readDashboard();

		expect(result).toEqual({
			totalViews: 0,
			posts: [],
			viewsLast7Days: 0,
			viewsLast30Days: 0,
			trafficOrigin: [],
			browsers: [],
		});
	});

	test("Should include period/origin/browser breakdowns after views are recorded", async () => {
		const adminCtx = await createAuthenticatedContext({ role: "ADMIN" });
		const post = await adminCtx.createPost({
			userId: adminCtx.user.id,
			status: "PUBLISHED",
		});

		await AnalyticsRouter.createCaller(adminCtx).recordView({
			postId: post.id,
		});

		const result = await AnalyticsRouter.createCaller(adminCtx).readDashboard();

		expect(result.viewsLast7Days).toBe(1);
		expect(result.viewsLast30Days).toBe(1);
		expect(result.trafficOrigin).toEqual([{ bucket: "DIRECT", count: 1 }]);
	});
});
