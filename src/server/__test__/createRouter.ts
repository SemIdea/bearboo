import { describe, expect, test } from "vitest";
import { AuthErrorCode } from "@/shared/error/auth";
import { SessionErrorCode } from "@/shared/error/session";
import { createAuthenticatedContext, createTestContext } from "@/test/context";
import {
	protectedProcedure,
	publicProcedure,
	roleProcedure,
	t,
	verifiedProcedure,
} from "../createRouter";
import {
	SESSION_IDLE_TIMEOUT_MS,
	SESSION_MAX_LIFETIME_MS,
} from "../features/auth/constants";

const testRouter = t.router({
	publicValue: publicProcedure.query(({ ctx }) => ctx.user?.id ?? "anonymous"),
	protectedValue: protectedProcedure.query(({ ctx }) => ctx.user.id),
	verifiedValue: verifiedProcedure.query(({ ctx }) => ctx.user.id),
	adminValue: roleProcedure(["ADMIN"]).query(({ ctx }) => ctx.user.id),
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

	test("blocks idle authenticated sessions on public middleware", async () => {
		const ctx = await createAuthenticatedContext();
		ctx.user.session.updatedAt = new Date(
			Date.now() - SESSION_IDLE_TIMEOUT_MS - 1_000,
		);

		await expect(
			testRouter.createCaller(ctx).publicValue(),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			message: SessionErrorCode.SESSION_EXPIRED,
		});
	});

	test("blocks sessions past the absolute max lifetime even if recently updated", async () => {
		const ctx = await createAuthenticatedContext();
		ctx.user.session.createdAt = new Date(
			Date.now() - SESSION_MAX_LIFETIME_MS - 1_000,
		);
		ctx.user.session.updatedAt = new Date();

		await expect(
			testRouter.createCaller(ctx).publicValue(),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			message: SessionErrorCode.SESSION_EXPIRED,
		});
	});

	test("allows sessions that are neither idle nor past max lifetime", async () => {
		const ctx = await createAuthenticatedContext();

		await expect(testRouter.createCaller(ctx).publicValue()).resolves.toBe(
			ctx.user.id,
		);
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

	test("blocks users whose role is not in the allowlist", async () => {
		const ctx = await createAuthenticatedContext({ role: "AUTHOR" });

		await expect(
			testRouter.createCaller(ctx).adminValue(),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: AuthErrorCode.INSUFFICIENT_ROLE,
		});
	});

	test("allows users whose role is in the allowlist", async () => {
		const ctx = await createAuthenticatedContext({ role: "ADMIN" });

		await expect(testRouter.createCaller(ctx).adminValue()).resolves.toBe(
			ctx.user.id,
		);
	});
});
