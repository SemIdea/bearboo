import { beforeEach, describe, expect, test } from "vitest";
import { baseProcedure, t } from "@/server/createRouter";
import { AppError } from "@/shared/error/appError";
import { createTestContext, ITestContextDTO } from "@/test/context";

// The whole point of the middleware is that a procedure needs no try/catch to
// report the right transport code. So every procedure below is written the way
// a procedure should now look: it just calls through and lets the error rise.
const router = t.router({
	recoverable: baseProcedure.query(() => {
		throw new AppError("post.not_found");
	}),
	forbidden: baseProcedure.query(() => {
		throw new AppError("comment.update_forbidden");
	}),
	bug: baseProcedure.query(() => {
		throw new TypeError("cannot read properties of undefined");
	}),
	fine: baseProcedure.query(() => "ok"),
});

describe("withAppErrors", () => {
	let ctx: ITestContextDTO;

	beforeEach(async () => {
		ctx = await createTestContext();
	});

	test("translates a AppError into its mapped transport code", async () => {
		await expect(router.createCaller(ctx).recoverable()).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Post not found.",
		});
	});

	test("resolves the transport code per domain code, not per category", async () => {
		await expect(router.createCaller(ctx).forbidden()).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to update this comment.",
		});
	});

	test("keeps the AppError as cause", async () => {
		// errorFormatter (domainCode), logBoundaryError and caller.ts all read
		// `error.cause` — dropping it would silently break the redirect on an
		// expired session.
		const error = await router
			.createCaller(ctx)
			.recoverable()
			.catch((thrown: unknown) => thrown);

		expect((error as { cause: unknown }).cause).toBeInstanceOf(AppError);
		expect((error as { cause: AppError }).cause.code).toBe("post.not_found");
	});

	test("leaves an unexpected throw as an internal error", async () => {
		// A bug must not be dressed up as a domain error (regra 33).
		await expect(router.createCaller(ctx).bug()).rejects.toMatchObject({
			code: "INTERNAL_SERVER_ERROR",
		});
	});

	test("does not disturb a successful call", async () => {
		await expect(router.createCaller(ctx).fine()).resolves.toBe("ok");
	});
});
