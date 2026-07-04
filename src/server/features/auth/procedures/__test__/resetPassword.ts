import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { ResetTokenErrorCodes } from "@/shared/error/resetToken";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { AuthRouter } from "../../index";

describe("Reset Token Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should reset the user password", async () => {
		const email = ctx.user.email;

		await AuthRouter.createCaller(ctx).sendResetPasswordEmail({ email });

		const resetToken = await ctx.repositories.resetToken.readByUserId(
			ctx.user.id,
		);

		const result = await AuthRouter.createCaller(ctx).resetPassword({
			token: resetToken!.token,
			password: "NewPassword1234",
			confirmPassword: "NewPassword1234",
		});

		const updatedUser = await ctx.repositories.user.read(ctx.user.id);

		expect(result).toBeDefined();
		expect(updatedUser?.password).not.toBe(ctx.user.password);
	});

	test("Should throw an error if reset token is invalid", async () => {
		await expect(
			AuthRouter.createCaller(ctx).resetPassword({
				token: "invalid-token",
				password: "NewPassword1234",
				confirmPassword: "NewPassword1234",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: ResetTokenErrorCodes.TOKEN_NOT_FOUND,
			}),
		);
	});

	test("Should throw an error if token is already used", async () => {
		const resetToken = await ctx.repositories.resetToken.create(
			ctx.helpers.uid.generate(),
			{
				userId: ctx.user.id,
				token: ctx.helpers.uid.generate(),
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
				used: true,
			},
		);

		await expect(
			AuthRouter.createCaller(ctx).resetPassword({
				token: resetToken.token,
				password: "NewPassword1234",
				confirmPassword: "NewPassword1234",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: ResetTokenErrorCodes.TOKEN_ALREADY_USED,
			}),
		);
	});

	test("Should throw an error if token is expired", async () => {
		const resetToken = await ctx.repositories.resetToken.create(
			ctx.helpers.uid.generate(),
			{
				userId: ctx.user.id,
				token: ctx.helpers.uid.generate(),
				expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
				used: false,
			},
		);

		await expect(
			AuthRouter.createCaller(ctx).resetPassword({
				token: resetToken.token,
				password: "NewPassword1234",
				confirmPassword: "NewPassword1234",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: ResetTokenErrorCodes.TOKEN_EXPIRED,
			}),
		);
	});

	test("Should throw an error if passwords do not match", async () => {
		const resetToken = await ctx.repositories.resetToken.create(
			ctx.helpers.uid.generate(),
			{
				userId: ctx.user.id,
				token: ctx.helpers.uid.generate(),
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
				used: false,
			},
		);

		await expect(
			AuthRouter.createCaller(ctx).resetPassword({
				token: resetToken.token,
				password: "NewPassword1234",
				confirmPassword: "DifferentPassword1234",
			}),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
		});
	});
});
