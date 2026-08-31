import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { CommentRouter } from "../../index";

describe("Update Comment Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should update a comment successfully", async () => {
		const comment = await ctx.createComment();

		const input = {
			id: comment.id,
			content: "This is an updated test comment.",
		};

		const result = await CommentRouter.createCaller(ctx).update(input);

		expect(result).toBeDefined();
		expect(result.id).toEqual(comment.id);
		expect(result.content).toEqual(input.content);
		expect(result.postId).toEqual(comment.postId);
		expect(result.userId).toEqual(ctx.user.id);
	});

	test("Should throw an error if the comment does not exist", async () => {
		const input = {
			id: ctx.helpers.uid.generate(),
			content: "This comment does not exist.",
		};

		await expect(
			CommentRouter.createCaller(ctx).update(input),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Comment not found. Please check the ID.",
		});
	});

	test("Should throw an error if the user is not the owner of the comment", async () => {
		const otherUser = await ctx.createNewUser();
		const comment = await ctx.createComment({ userId: otherUser.id });

		const input = {
			id: comment.id,
			content: "This is an updated test comment.",
		};

		await expect(
			CommentRouter.createCaller(ctx).update(input),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to update this comment.",
		});
	});
});
