import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { DomainError } from "@/shared/error/domainError";
import { createTRPCContext } from "../createContext";

const readUserAndSessionByAccessTokenMock = vi.hoisted(() => vi.fn());

vi.mock("../features/auth/domain/readUserAndSessionByAccessToken", () => ({
	domain_readUserAndSessionByAccessToken: readUserAndSessionByAccessTokenMock,
}));

describe("createTRPCContext", () => {
	beforeEach(() => {
		readUserAndSessionByAccessTokenMock.mockReset();
	});

	test("creates an anonymous context when no cookie header exists", async () => {
		const ctx = await createTRPCContext({ headers: new Headers() });

		expect(ctx.user).toBeUndefined();
		expect(ctx.repositories).toBeDefined();
		expect(ctx.helpers).toBeDefined();
		expect(ctx.gateways).toBeDefined();
		expect(readUserAndSessionByAccessTokenMock).not.toHaveBeenCalled();
	});

	test("does not authenticate when accessToken cookie is missing", async () => {
		const ctx = await createTRPCContext({
			headers: new Headers({ cookie: "theme=dark" }),
		});

		expect(ctx.user).toBeUndefined();
		expect(readUserAndSessionByAccessTokenMock).not.toHaveBeenCalled();
	});

	test("hydrates authenticated user from accessToken cookie", async () => {
		const user = {
			id: "user-1",
			name: "User",
			email: "user@example.com",
			verified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			session: {
				id: "session-1",
				accessToken: "access-token",
				refreshToken: "refresh-token",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		};

		readUserAndSessionByAccessTokenMock.mockResolvedValue(user);

		const headers = new Headers({
			cookie: "theme=dark; accessToken=access-token",
		});
		const ctx = await createTRPCContext({ headers });

		expect(ctx.user).toBe(user);
		expect(readUserAndSessionByAccessTokenMock).toHaveBeenCalledWith({
			ctx: expect.objectContaining({ headers }),
			input: { accessToken: "access-token" },
		});
	});

	test("keeps context anonymous when token lookup returns no user", async () => {
		readUserAndSessionByAccessTokenMock.mockResolvedValue(null);

		const ctx = await createTRPCContext({
			headers: new Headers({ cookie: "accessToken=stale-token" }),
		});

		expect(ctx.user).toBeUndefined();
	});

	test("degrades to an anonymous context and clears stale cookies when the access token is invalid, instead of throwing", async () => {
		readUserAndSessionByAccessTokenMock.mockRejectedValue(
			new DomainError("session.access_token_invalid"),
		);

		const ctx = await createTRPCContext({
			headers: new Headers({
				cookie: "accessToken=stale-token; refreshToken=stale-refresh",
			}),
		});

		expect(ctx.user).toBeUndefined();
		expect(ctx.resCookies.pending).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ name: "accessToken", value: "" }),
				expect.objectContaining({ name: "refreshToken", value: "" }),
			]),
		);
	});

	test("does not swallow errors unrelated to an invalid token", async () => {
		readUserAndSessionByAccessTokenMock.mockRejectedValue(
			new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "db down" }),
		);

		await expect(
			createTRPCContext({
				headers: new Headers({ cookie: "accessToken=some-token" }),
			}),
		).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
	});
});
