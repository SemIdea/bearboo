import { describe, expect, test } from "vitest";
import { AuthErrorCode } from "@/shared/error/auth";
import { SessionErrorCode } from "@/shared/error/session";
import { createAuthenticatedContext, createTestContext } from "@/test/context";
import {
	protectedProcedure,
	publicProcedure,
	t,
	verifiedProcedure,
} from "../createRouter";

const testRouter = t.router({
	publicValue: publicProcedure.query(({ ctx }) => ctx.user?.id ?? "anonymous"),
	protectedValue: protectedProcedure.query(({ ctx }) => ctx.user.id),
	verifiedValue: verifiedProcedure.query(({ ctx }) => ctx.user.id),
});

describe("TRPC procedure guards", () => {
	test("allows public procedure without an authenticated user", async () => {
		const ctx = createTestContext();

		await expect(testRouter.createCaller(ctx).publicValue()).resolves.toBe(
			"anonymous",
		);
	});

	test("blocks protected procedure without an authenticated user", async () => {
		const ctx = createTestContext();

		await expect(
			testRouter.createCaller(ctx).protectedValue(),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			message: AuthErrorCode.USER_NOT_LOGGED_IN,
		});
	});

	test("blocks expired authenticated sessions on public middleware", async () => {
		const ctx = await createAuthenticatedContext();
		ctx.user.session.updatedAt = new Date(Date.now() - 21_000);

		await expect(
			testRouter.createCaller(ctx).publicValue(),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			message: SessionErrorCode.SESSION_EXPIRED,
		});
	});

	test("blocks unverified users from verified procedures", async () => {
		const ctx = await createAuthenticatedContext();
		ctx.user.verified = false;

		await expect(
			testRouter.createCaller(ctx).verifiedValue(),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: AuthErrorCode.USER_NOT_VERIFIED,
		});
	});

	test("allows verified users through verified procedures", async () => {
		const ctx = await createAuthenticatedContext();

		await expect(testRouter.createCaller(ctx).verifiedValue()).resolves.toBe(
			ctx.user.id,
		);
	});
});
