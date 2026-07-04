import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { CommentRouter } from "../index";

describe("Create Comment Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should create a comment successfully", async () => {
		const post = await ctx.createPost();

		const input = {
			postId: post.id,
			content: "This is a test comment.",
		};

		const result = await CommentRouter.createCaller(ctx).create(input);

		expect(result).toBeDefined();
		expect(result.content).toEqual(input.content);
		expect(result.postId).toEqual(input.postId);
		expect(result.userId).toEqual(ctx.user.id);
	});
});
