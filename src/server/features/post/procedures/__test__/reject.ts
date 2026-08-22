import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Reject Post Controller Unitary Testing", () => {
	let authorCtx: IControllerContextDTO;
	let editorCtx: IControllerContextDTO;

	beforeEach(async () => {
		authorCtx = await createAuthenticatedContext();
		editorCtx = await createAuthenticatedContext({ role: "EDITOR" });
	});

	test("Should reject a post in review back to draft with a reason", async () => {
		const post = await authorCtx.createPost({ status: "IN_REVIEW" });

		const result = await PostRouter.createCaller(editorCtx).reject({
			id: post.id,
			comment: "Needs more detail in the introduction.",
		});

		expect(result.status).toEqual("DRAFT");

		const comments = await PostRouter.createCaller(
			editorCtx,
		).readReviewComments({ postId: post.id });

		expect(comments).toHaveLength(1);
		expect(comments[0]).toMatchObject({
			type: "REJECTION",
			content: "Needs more detail in the introduction.",
		});
	});

	test("Should throw an error if the caller is an Author", async () => {
		const post = await authorCtx.createPost({ status: "IN_REVIEW" });

		await expect(
			PostRouter.createCaller(authorCtx).reject({
				id: post.id,
				comment: "Not allowed.",
			}),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to update this post.",
		});
	});

	test("Should throw an error if the post is not in review", async () => {
		const post = await authorCtx.createPost({ status: "DRAFT" });

		await expect(
			PostRouter.createCaller(editorCtx).reject({
				id: post.id,
				comment: "Not in review.",
			}),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: "This action is not valid for the post's current status.",
		});
	});
});
