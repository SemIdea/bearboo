import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { ISessionEntity } from "@/server/models/session";
import { SessionErrorCode, SessionErrorMessages } from "@/shared/error/session";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { REFRESH_RATE_LIMIT } from "../../constants";
import { AuthRouter } from "../../index";

describe("Refresh Session Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should refresh session successfully using the refreshToken cookie", async () => {
		const user = ctx.user;
		ctx.refreshToken = user.session.refreshToken;

		await AuthRouter.createCaller(ctx).refreshSession();

		const result = (await ctx.repositories.session.read(
			user.session.id,
		)) as ISessionEntity;

		expect(result).toBeDefined();
		expect(result.accessToken).not.toBe(user.session.accessToken);
		expect(result.refreshToken).not.toBe(user.session.refreshToken);
		expect(result.userId).toBe(user.id);
	});

	test("Should set accessToken/refreshToken cookies on success, never in the response body", async () => {
		ctx.refreshToken = ctx.user.session.refreshToken;

		const result = await AuthRouter.createCaller(ctx).refreshSession();

		expect(result).toEqual({ success: true });
		const cookieNames = ctx.resCookies.pending.map((cookie) => cookie.name);
		expect(cookieNames).toEqual(
			expect.arrayContaining(["accessToken", "refreshToken"]),
		);
	});

	test("Should throw MISSING_TOKEN when there is no refreshToken cookie", async () => {
		await expect(
			AuthRouter.createCaller(ctx).refreshSession(),
		).rejects.toThrowError(
			new TRPCError({
				code: "UNAUTHORIZED",
				message: SessionErrorCode.MISSING_TOKEN,
			}),
		);
	});

	test("Should throw an error if token is invalid", async () => {
		ctx.refreshToken = "invalid-token";

		await expect(
			AuthRouter.createCaller(ctx).refreshSession(),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: SessionErrorMessages[SessionErrorCode.INVALID_TOKEN],
		});
	});

	test("Should clear accessToken/refreshToken cookies when the refresh token is invalid or reused, so the client stops resending a dead cookie", async () => {
		ctx.refreshToken = "invalid-token";

		await AuthRouter.createCaller(ctx)
			.refreshSession()
			.catch(() => undefined);

		expect(ctx.resCookies.pending).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "accessToken", value: "" }),
				expect.objectContaining({ name: "refreshToken", value: "" }),
			]),
		);
	});

	test("Should clear cookies when a rotated-out refresh token is reused (e.g. a duplicate refresh call racing the first one)", async () => {
		const originalRefreshToken = ctx.user.session.refreshToken;
		ctx.refreshToken = originalRefreshToken;

		await AuthRouter.createCaller(ctx).refreshSession();

		ctx.refreshToken = originalRefreshToken;

		await AuthRouter.createCaller(ctx)
			.refreshSession()
			.catch(() => undefined);

		expect(ctx.resCookies.pending.at(-2)).toMatchObject({
			name: "accessToken",
			value: "",
		});
		expect(ctx.resCookies.pending.at(-1)).toMatchObject({
			name: "refreshToken",
			value: "",
		});
	});

	test("Should enforce the refresh rate limit", async () => {
		ctx.refreshToken = "invalid-token";

		for (let i = 0; i < REFRESH_RATE_LIMIT.max; i++) {
			await AuthRouter.createCaller(ctx)
				.refreshSession()
				.catch(() => undefined);
		}

		await expect(
			AuthRouter.createCaller(ctx).refreshSession(),
		).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
	});
});
