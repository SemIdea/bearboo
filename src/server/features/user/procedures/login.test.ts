import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { UserErrorCode } from "@/shared/error/user";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { UserRouter } from "../index";

describe("Login User Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should return a session if valid credentials", async () => {
		const user = ctx.user;

		const result = await UserRouter.createCaller(ctx).login({
			email: user.email,
			password: user.truePassword,
		});

		expect(result).toBeDefined();
		expect(result.id).toBeDefined();
		expect(result.user.id).toEqual(user.id);
	});

	test("Should throw an error if user does not exist", async () => {
		const uuid = ctx.helpers.uid.generate();

		await expect(
			UserRouter.createCaller(ctx).login({
				email: `${uuid}@example.com`,
				password: "password123",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: UserErrorCode.USER_NOT_FOUND,
			}),
		);
	});
});
