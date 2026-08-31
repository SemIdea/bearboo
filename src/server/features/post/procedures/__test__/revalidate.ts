import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

vi.mock("next/cache", () => ({
	revalidateTag: vi.fn(),
}));

describe("Revalidate Post Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should revalidate a post successfully", async () => {
		const post = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).revalidate({
			id: post.id,
		});

		expect(result).toBeDefined();
		expect(result.id).toBe(post.id);
		expect(result.userId).toBe(ctx.user.id);

		expect(revalidateTag).toHaveBeenCalledWith("posts", "hours");
	});

	test("Should throw an error if post does not exist", async () => {
		await expect(
			PostRouter.createCaller(ctx).revalidate({ id: "non-existent-post-id" }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Post not found.",
		});
	});

	test("Should throw an error if user is not the owner of the post", async () => {
		const otherUser = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: otherUser.id });

		await expect(
			PostRouter.createCaller(ctx).revalidate({ id: post.id }),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to update this post.",
		});
	});
});
