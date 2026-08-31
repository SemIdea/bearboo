import { afterEach, describe, expect, test, vi } from "vitest";
import { AppError } from "@/shared/error/appError";
import { createAuthenticatedContext, createTestContext } from "@/test/context";
import { domain_createAuthSession } from "../createAuthSession";
import { domain_createResetToken } from "../createResetToken";
import { domain_createToken } from "../createToken";
import { domain_deleteSession } from "../deleteSession";
import { domain_readSessionByRefreshToken } from "../readSessionByRefreshToken";
import { domain_readUserAndSessionByAccessToken } from "../readUserAndSessionByAccessToken";
import { domain_reCreateToken } from "../reCreateToken";
import { domain_refreshSession } from "../refreshSession";

describe("auth session and token domains", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("creates auth sessions for existing users", async () => {
		const ctx = await createAuthenticatedContext();

		const session = await domain_createAuthSession({
			ctx,
			input: { userId: ctx.user.id },
		});

		expect(session).toMatchObject({ userId: ctx.user.id });
		expect(session.id).toEqual(expect.any(String));
		expect(session.accessToken).toEqual(expect.any(String));
		expect(session.refreshToken).toEqual(expect.any(String));
	});

	test("rejects auth session creation for missing users", async () => {
		const ctx = createTestContext();

		await expect(
			domain_createAuthSession({ ctx, input: { userId: "missing-user" } }),
		).rejects.toMatchObject(new AppError("user.not_found"));
	});

	test("surfaces session_create_error when the store returns no session", async () => {
		const ctx = await createAuthenticatedContext();
		vi.spyOn(ctx.repositories.session, "create").mockResolvedValueOnce(
			null as never,
		);

		await expect(
			domain_createAuthSession({ ctx, input: { userId: ctx.user.id } }),
		).rejects.toMatchObject(new AppError("session.session_create_error"));
	});

	test("creates verification tokens with a future expiration", async () => {
		const ctx = await createAuthenticatedContext();
		const beforeCreate = Date.now();

		const token = await domain_createToken({
			ctx,
			input: { userId: ctx.user.id },
		});

		expect(token).toMatchObject({
			userId: ctx.user.id,
			used: false,
		});
		expect(token.token).toEqual(expect.any(String));
		expect(token.expiresAt.getTime()).toBeGreaterThan(beforeCreate);
	});

	test("creates reset tokens from user email", async () => {
		const ctx = await createAuthenticatedContext();

		const token = await domain_createResetToken({
			ctx,
			input: { email: ctx.user.email },
		});

		expect(token).toMatchObject({
			userId: ctx.user.id,
			used: false,
		});
		expect(await ctx.repositories.resetToken.readByToken(token!.token)).toEqual(
			token,
		);
	});

	test("returns null for reset tokens when the email doesn't exist", async () => {
		const ctx = createTestContext();

		await expect(
			domain_createResetToken({
				ctx,
				input: { email: "missing@example.com" },
			}),
		).resolves.toBeNull();
	});

	test("recreates verification tokens by deleting an existing token first", async () => {
		const ctx = await createAuthenticatedContext();
		const existingToken = await domain_createToken({
			ctx,
			input: { userId: ctx.user.id },
		});

		const recreatedToken = await domain_reCreateToken({
			ctx,
			input: { userEmail: ctx.user.email },
		});

		expect(
			await ctx.repositories.verifyToken.read(existingToken.id),
		).toBeNull();
		expect(recreatedToken.userId).toBe(ctx.user.id);
		expect(recreatedToken.id).not.toBe(existingToken.id);
	});

	test("reads sessions by refresh token", async () => {
		const ctx = await createAuthenticatedContext();

		await expect(
			domain_readSessionByRefreshToken({
				ctx,
				input: { refreshToken: ctx.user.session.refreshToken },
			}),
		).resolves.toEqual(ctx.user.session);
	});

	test("throws when refresh token is invalid", async () => {
		const ctx = createTestContext();

		await expect(
			domain_readSessionByRefreshToken({
				ctx,
				input: { refreshToken: "invalid-token" },
			}),
		).rejects.toMatchObject(new AppError("session.refresh_token_invalid"));
	});

	test("reads user and session by access token without exposing password", async () => {
		const ctx = await createAuthenticatedContext();

		const result = await domain_readUserAndSessionByAccessToken({
			ctx,
			input: { accessToken: ctx.user.session.accessToken },
		});

		expect(result).toMatchObject({
			id: ctx.user.id,
			email: ctx.user.email,
			role: ctx.user.role,
			session: {
				id: ctx.user.session.id,
				accessToken: ctx.user.session.accessToken,
				refreshToken: ctx.user.session.refreshToken,
			},
		});
		expect("password" in result).toBe(false);
		expect("userId" in result.session).toBe(false);
	});

	test("propagates role into ctx.user for a non-default role", async () => {
		const ctx = await createAuthenticatedContext({ role: "ADMIN" });

		const result = await domain_readUserAndSessionByAccessToken({
			ctx,
			input: { accessToken: ctx.user.session.accessToken },
		});

		expect(result.role).toBe("ADMIN");
	});

	test("throws when access token has no session or user", async () => {
		const ctx = createTestContext();

		await expect(
			domain_readUserAndSessionByAccessToken({
				ctx,
				input: { accessToken: "missing-access-token" },
			}),
		).rejects.toMatchObject(new AppError("session.access_token_invalid"));

		const session = await ctx.repositories.session.create("session-1", {
			userId: "missing-user",
			accessToken: "access-token",
			refreshToken: "refresh-token",
		});

		await expect(
			domain_readUserAndSessionByAccessToken({
				ctx,
				input: { accessToken: session.accessToken },
			}),
		).rejects.toMatchObject(new AppError("session.access_token_invalid"));
	});

	test("refreshes sessions by rotating tokens", async () => {
		const ctx = await createAuthenticatedContext();
		const originalRefreshToken = ctx.user.session.refreshToken;

		const refreshedSession = await domain_refreshSession({
			ctx,
			input: {
				id: ctx.user.session.id,
				currentRefreshToken: originalRefreshToken,
			},
		});

		expect(refreshedSession.id).toBe(ctx.user.session.id);
		expect(refreshedSession.accessToken).not.toBe(ctx.user.session.accessToken);
		expect(refreshedSession.refreshToken).not.toBe(originalRefreshToken);
		expect(refreshedSession.previousRefreshToken).toBe(originalRefreshToken);
	});

	test("surfaces session_update_error when the store returns no session", async () => {
		const ctx = await createAuthenticatedContext();
		vi.spyOn(ctx.repositories.session, "update").mockResolvedValueOnce(
			null as never,
		);

		await expect(
			domain_refreshSession({
				ctx,
				input: {
					id: ctx.user.session.id,
					currentRefreshToken: ctx.user.session.refreshToken,
				},
			}),
		).rejects.toMatchObject(new AppError("session.session_update_error"));
	});

	test("rejects reuse of a rotated-out refresh token and revokes the session", async () => {
		const ctx = await createAuthenticatedContext();
		const originalRefreshToken = ctx.user.session.refreshToken;

		await domain_refreshSession({
			ctx,
			input: {
				id: ctx.user.session.id,
				currentRefreshToken: originalRefreshToken,
			},
		});

		await expect(
			domain_readSessionByRefreshToken({
				ctx,
				input: { refreshToken: originalRefreshToken },
			}),
		).rejects.toMatchObject(new AppError("session.refresh_token_invalid"));

		await expect(
			ctx.repositories.session.read(ctx.user.session.id),
		).resolves.toBeNull();
	});

	test("deletes existing sessions and rejects missing sessions", async () => {
		const ctx = await createAuthenticatedContext();

		await expect(
			domain_deleteSession({
				ctx,
				input: { id: ctx.user.session.id, userId: ctx.user.id },
			}),
		).resolves.toBeUndefined();
		await expect(
			ctx.repositories.session.read(ctx.user.session.id),
		).resolves.toBeNull();

		await expect(
			domain_deleteSession({
				ctx,
				input: { id: "missing-session", userId: ctx.user.id },
			}),
		).rejects.toMatchObject(new AppError("session.session_not_found"));
	});
});
