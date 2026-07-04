import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { UserErrorCode } from "@/shared/error/user";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { UserRouter } from "../../index";

describe("User Comments Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should return an empty array if user has no comments", async () => {
		const user = ctx.user;

		const result = await UserRouter.createCaller(ctx).readComments({
			id: user.id,
		});

		expect(result).toBeDefined();
		expect(result.length).toEqual(0);
	});

	test("Should read user comments successfully", async () => {
		const comment = await ctx.createComment();

		const result = await UserRouter.createCaller(ctx).readComments({
			id: ctx.user.id,
		});

		expect(result).toBeDefined();
		expect(result.length).toBeGreaterThanOrEqual(1);
		expect(result[0].id).toEqual(comment.id);
		expect(result[0].content).toEqual(comment.content);
		expect(result[0].postId).toEqual(comment.postId);
		expect(result[0].userId).toEqual(ctx.user.id);
	});

	test("Should return an error if user does not exist", async () => {
		const userId = ctx.helpers.uid.generate();

		await expect(
			UserRouter.createCaller(ctx).readComments({ id: userId }),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: UserErrorCode.USER_NOT_FOUND,
			}),
		);
	});
});
