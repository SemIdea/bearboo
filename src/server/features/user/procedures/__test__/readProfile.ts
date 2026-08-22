import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { UserRouter } from "../../index";

describe("Read Profile User Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should return user profile", async () => {
		const user = ctx.user;

		const result = await UserRouter.createCaller(ctx).read({ id: user.id });

		expect(result).toBeTruthy();
		expect(result.id).toEqual(user.id);
	});

	test("Should throw error if user does not exist", async () => {
		const uuid = ctx.helpers.uid.generate();

		await expect(
			UserRouter.createCaller(ctx).read({ id: uuid }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "User not found. Please check the email.",
		});
	});
});
