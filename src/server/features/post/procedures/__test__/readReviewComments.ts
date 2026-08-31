import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Review Comments Controller Unitary Testing", () => {
	let authorCtx: IControllerContextDTO;
	let editorCtx: IControllerContextDTO;

	beforeEach(async () => {
		authorCtx = await createAuthenticatedContext();
		editorCtx = await createAuthenticatedContext({ role: "EDITOR" });
	});

	test("Should let the owner read the review comments of their own post", async () => {
		const post = await authorCtx.createPost({ status: "IN_REVIEW" });
		await PostRouter.createCaller(editorCtx).reject({
			id: post.id,
			comment: "Please revise the title.",
		});

		const comments = await PostRouter.createCaller(
			authorCtx,
		).readReviewComments({ postId: post.id });

		expect(comments).toHaveLength(1);
		expect(comments[0].content).toEqual("Please revise the title.");
	});

	test("Should let an Editor read the review comments of a post they don't own", async () => {
		const post = await authorCtx.createPost({ status: "IN_REVIEW" });
		await PostRouter.createCaller(editorCtx).reject({
			id: post.id,
			comment: "Please revise the title.",
		});

		const comments = await PostRouter.createCaller(
			editorCtx,
		).readReviewComments({ postId: post.id });

		expect(comments).toHaveLength(1);
	});

	test("Should throw an error if the caller neither owns the post nor can review", async () => {
		const otherAuthorCtx = await createAuthenticatedContext();
		const post = await authorCtx.createPost({ status: "IN_REVIEW" });

		await expect(
			PostRouter.createCaller(otherAuthorCtx).readReviewComments({
				postId: post.id,
			}),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to update this post.",
		});
	});

	test("Should throw an error if the post does not exist", async () => {
		await expect(
			PostRouter.createCaller(authorCtx).readReviewComments({
				postId: "non-existent-id",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Post not found.",
		});
	});
});
