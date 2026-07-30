import { beforeEach, describe, expect, test } from "vitest";
import { LOGIN_RATE_LIMIT } from "@/server/features/auth/constants";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { UserRouter } from "../../index";

describe("Login User Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should return only the user on valid credentials, never tokens", async () => {
		const user = ctx.user;

		const result = await UserRouter.createCaller(ctx).login({
			email: user.email,
			password: user.truePassword,
		});

		expect(result).toEqual({
			user: expect.objectContaining({ id: user.id }),
		});
	});

	test("Should set accessToken/refreshToken cookies on success", async () => {
		const user = ctx.user;

		await UserRouter.createCaller(ctx).login({
			email: user.email,
			password: user.truePassword,
		});

		const cookieNames = ctx.resCookies.pending.map((cookie) => cookie.name);
		expect(cookieNames).toEqual(
			expect.arrayContaining(["accessToken", "refreshToken"]),
		);
	});

	test("Should throw the same error for a missing email as for a wrong password", async () => {
		const uuid = ctx.helpers.uid.generate();
		const expectedError = {
			code: "UNAUTHORIZED",
			message: "Invalid email or password. Please try again.",
		};

		await expect(
			UserRouter.createCaller(ctx).login({
				email: `${uuid}@example.com`,
				password: "password123",
			}),
		).rejects.toMatchObject(expectedError);

		await expect(
			UserRouter.createCaller(ctx).login({
				email: ctx.user.email,
				password: "wrong-password",
			}),
		).rejects.toMatchObject(expectedError);
	});

	test("Should enforce the login rate limit", async () => {
		for (let i = 0; i < LOGIN_RATE_LIMIT.max; i++) {
			await UserRouter.createCaller(ctx)
				.login({ email: ctx.user.email, password: "wrong-password" })
				.catch(() => undefined);
		}

		await expect(
			UserRouter.createCaller(ctx).login({
				email: ctx.user.email,
				password: ctx.user.truePassword,
			}),
		).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
	});
});
