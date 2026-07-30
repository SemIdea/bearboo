import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Submit For Review Post Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should submit the caller's own draft for review", async () => {
		const post = await ctx.createPost({ status: "DRAFT" });

		const result = await PostRouter.createCaller(ctx).submitForReview({
			id: post.id,
		});

		expect(result.status).toEqual("IN_REVIEW");
	});

	test("Should throw an error if the post does not exist", async () => {
		await expect(
			PostRouter.createCaller(ctx).submitForReview({
				id: "non-existent-id",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Post not found.",
		});
	});

	test("Should throw an error if the caller does not own the post", async () => {
		const otherUser = await ctx.createNewUser();
		const post = await ctx.createPost({
			status: "DRAFT",
			userId: otherUser.id,
		});

		await expect(
			PostRouter.createCaller(ctx).submitForReview({ id: post.id }),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to update this post.",
		});
	});

	test("Should throw an error if the post is not a draft", async () => {
		const post = await ctx.createPost({ status: "PUBLISHED" });

		await expect(
			PostRouter.createCaller(ctx).submitForReview({ id: post.id }),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: "This action is not valid for the post's current status.",
		});
	});
});
