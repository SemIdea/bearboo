import { describe, expect, test } from "vitest";
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
			message: "You are not logged in. Please log in to continue.",
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
			message: "Your session has expired. Please log in again.",
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
			message: "Your session has expired. Please log in again.",
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
			message: "Your account is not verified. Please check your email.",
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
			message: "You do not have permission to perform this action.",
		});
	});

	test("allows users whose role is in the allowlist", async () => {
		const ctx = await createAuthenticatedContext({ role: "ADMIN" });

		await expect(testRouter.createCaller(ctx).adminValue()).resolves.toBe(
			ctx.user.id,
		);
	});
});
