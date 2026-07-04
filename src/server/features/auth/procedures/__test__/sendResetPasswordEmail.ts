import { beforeEach, describe, expect, test } from "vitest";
import { UserErrorCode } from "@/shared/error/user";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { AuthRouter } from "../../index";

describe("Send Reset Password Email Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should create a reset token and send a reset token email", async () => {
		const result = await AuthRouter.createCaller(ctx).sendResetPasswordEmail({
			email: ctx.user.email,
		});

		const resetToken = await ctx.repositories.resetToken.readByUserId(
			ctx.user.id,
		);

		expect(resetToken).toBeDefined();
		expect(resetToken?.userId).toBe(ctx.user.id);
		expect(result).toBeDefined();
		expect(result.success).toBe(true);
	});

	test("Should throw an error if user does not exist", async () => {
		await expect(
			AuthRouter.createCaller(ctx).sendResetPasswordEmail({
				email: "nonexistent@example.com",
			}),
		).rejects.toThrowError(UserErrorCode.USER_NOT_FOUND);
	});
});
