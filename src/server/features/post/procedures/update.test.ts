import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { PostErrorCode } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../index";

describe("Update Post Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should update a post successfully", async () => {
		const post = await ctx.createPost({
			title: "Original Title",
			content: "Original Content",
		});

		const result = await PostRouter.createCaller(ctx).update({
			id: post.id,
			content: "Updated Content",
			title: "Updated Title",
		});

		expect(result).toEqual({
			...post,
			content: "Updated Content",
			title: "Updated Title",
			updatedAt: result.updatedAt,
		});
	});

	test("Should throw error if post does not exist", async () => {
		await expect(
			PostRouter.createCaller(ctx).update({
				id: "non-existent-id",
				content: "Updated Content",
				title: "Updated Title",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			}),
		);
	});

	test("Should throw error if user tries to update a post they do not own", async () => {
		const otherUser = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: otherUser.id });

		await expect(
			PostRouter.createCaller(ctx).update({
				id: post.id,
				content: "Updated Content",
				title: "Updated Title",
			}),
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: PostErrorCode.POST_UPDATE_FORBIDDEN,
			}),
		);
	});
});
