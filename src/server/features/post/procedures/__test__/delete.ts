import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PostErrorCode, PostErrorMessages } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

vi.mock("next/cache", () => ({
	revalidateTag: vi.fn(),
}));

describe("Delete Post Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should delete a post successfully", async () => {
		const post = await ctx.createPost();
		const id = post.id;

		await PostRouter.createCaller(ctx).delete({ id });

		const result = await ctx.repositories.post.read(id);

		expect(result).toBeNull();
	});

	test("Should revalidate the posts cache tag after deleting", async () => {
		const post = await ctx.createPost();

		await PostRouter.createCaller(ctx).delete({ id: post.id });

		expect(revalidateTag).toHaveBeenCalledWith("posts", "hours");
	});

	test("Should throw an error if post does not exist", async () => {
		const id = ctx.helpers.uid.generate();

		await expect(
			PostRouter.createCaller(ctx).delete({ id }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: PostErrorMessages[PostErrorCode.POST_NOT_FOUND],
		});
	});

	test("Should throw an error if post does not belong to user", async () => {
		const otherUser = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: otherUser.id });

		await expect(
			PostRouter.createCaller(ctx).delete({ id: post.id }),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: PostErrorMessages[PostErrorCode.POST_DELETE_FORBIDDEN],
		});
	});

	test("Should allow an admin to delete a post they do not own", async () => {
		const adminCtx = await createAuthenticatedContext({ role: "ADMIN" });
		const post = await adminCtx.createPost({ userId: ctx.user.id });

		await PostRouter.createCaller(adminCtx).delete({ id: post.id });

		const result = await ctx.repositories.post.read(post.id);

		expect(result).toBeNull();
	});
});
