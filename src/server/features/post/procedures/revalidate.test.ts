import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PostErrorCode } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../index";

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
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

		expect(revalidatePath).toHaveBeenCalledWith(`/post/${post.id}`);
	});

	test("Should throw an error if post does not exist", async () => {
		await expect(
			PostRouter.createCaller(ctx).revalidate({ id: "non-existent-post-id" }),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			}),
		);
	});

	test("Should throw an error if user is not the owner of the post", async () => {
		const otherUser = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: otherUser.id });

		await expect(
			PostRouter.createCaller(ctx).revalidate({ id: post.id }),
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: PostErrorCode.POST_UPDATE_FORBIDDEN,
			}),
		);
	});
});
