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

		expect(result).toEqual({ totalViews: 0, posts: [] });
	});

	test("Should let an admin read the dashboard", async () => {
		const adminCtx = await createAuthenticatedContext({ role: "ADMIN" });

		const result = await AnalyticsRouter.createCaller(adminCtx).readDashboard();

		expect(result).toEqual({ totalViews: 0, posts: [] });
	});
});
