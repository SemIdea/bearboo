import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { AuthErrorCode } from "@/shared/error/auth";
import { UserErrorCode } from "@/shared/error/user";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { UserRouter } from "../../index";

describe("Update User Role Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext({ role: "ADMIN" });
	});

	test("Should allow an admin to promote another user", async () => {
		const otherUser = await ctx.createNewUser();

		const result = await UserRouter.createCaller(ctx).updateRole({
			userId: otherUser.id,
			role: "EDITOR",
		});

		expect(result.role).toEqual("EDITOR");
	});

	test("Should throw an error when the target user does not exist", async () => {
		await expect(
			UserRouter.createCaller(ctx).updateRole({
				userId: "non-existent-id",
				role: "EDITOR",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: UserErrorCode.USER_NOT_FOUND,
			}),
		);
	});

	test("Should reject an editor trying to change another user's role", async () => {
		const editorCtx = await createAuthenticatedContext({ role: "EDITOR" });
		const otherUser = await editorCtx.createNewUser();

		await expect(
			UserRouter.createCaller(editorCtx).updateRole({
				userId: otherUser.id,
				role: "ADMIN",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: AuthErrorCode.INSUFFICIENT_ROLE,
			}),
		);
	});

	test("Should reject an author trying to change another user's role", async () => {
		const authorCtx = await createAuthenticatedContext({ role: "AUTHOR" });
		const otherUser = await authorCtx.createNewUser();

		await expect(
			UserRouter.createCaller(authorCtx).updateRole({
				userId: otherUser.id,
				role: "ADMIN",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: AuthErrorCode.INSUFFICIENT_ROLE,
			}),
		);
	});
});
