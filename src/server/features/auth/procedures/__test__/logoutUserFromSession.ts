import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { AuthRouter } from "../../index";

describe("Logout Session Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should logout user successfully", async () => {
		const user = ctx.user;
		const session = user.session;

		await AuthRouter.createCaller(ctx).session.logout();

		const result = await ctx.repositories.session.read(session.id);

		expect(result).toBeNull();
	});

	test("Should clear the accessToken/refreshToken cookies", async () => {
		await AuthRouter.createCaller(ctx).session.logout();

		const cookieNames = ctx.resCookies.pending.map((cookie) => cookie.name);
		expect(cookieNames).toEqual(
			expect.arrayContaining(["accessToken", "refreshToken"]),
		);
		for (const cookie of ctx.resCookies.pending) {
			expect(cookie.value).toBe("");
			expect(cookie.expires?.getTime()).toBe(0);
		}
	});

	test("Should throw an error if user is not found", async () => {
		ctx.user.id = "non-existent-user-id";

		await expect(
			AuthRouter.createCaller(ctx).session.logout(),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "User not found. Please check the email.",
		});
	});

	test("Should throw an error if session is not found", async () => {
		ctx.user.session.id = "non-existent-session-id";

		await expect(
			AuthRouter.createCaller(ctx).session.logout(),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Session not found.",
		});
	});
});
