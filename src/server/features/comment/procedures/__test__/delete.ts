import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { CommentRouter } from "../../index";

describe("Delete Comment Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should delete a comment successfully", async () => {
		const comment = await ctx.createComment();

		await CommentRouter.createCaller(ctx).delete({ id: comment.id });

		const result = await ctx.repositories.comment.read(comment.id);

		expect(result).toBeNull();
	});

	test("Should throw an error when trying to delete a comment that does not exist", async () => {
		const input = {
			id: ctx.helpers.uid.generate(),
		};

		await expect(
			CommentRouter.createCaller(ctx).delete(input),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Comment not found. Please check the ID.",
		});
	});

	test("Should throw an error when trying to delete a comment that belongs to another user", async () => {
		const otherUser = await ctx.createNewUser();
		const comment = await ctx.createComment({ userId: otherUser.id });

		await expect(
			CommentRouter.createCaller(ctx).delete({ id: comment.id }),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to delete this comment.",
		});
	});
});
