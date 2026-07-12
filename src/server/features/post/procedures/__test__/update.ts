import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { PostErrorCode } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

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
			readingTimeMinutes: result.readingTimeMinutes,
		});
		expect(result.readingTimeMinutes).toBeGreaterThanOrEqual(1);
	});

	test("Should update the status of the caller's own post", async () => {
		const post = await ctx.createPost({ status: "PUBLISHED" });

		const result = await PostRouter.createCaller(ctx).update({
			id: post.id,
			status: "ARCHIVED",
		});

		expect(result.status).toEqual("ARCHIVED");
	});

	test("Should replace the tags of the caller's own post", async () => {
		const tagA = await ctx.createTag({ name: "prisma" });
		const tagB = await ctx.createTag({ name: "trpc" });
		const tagC = await ctx.createTag({ name: "zod" });
		const post = await ctx.createPost({ tagIds: [tagA.id, tagB.id] });

		await PostRouter.createCaller(ctx).update({
			id: post.id,
			tagIds: [tagC.id],
		});

		const read = await PostRouter.createCaller(ctx).readBySlug({
			slug: post.slug,
		});

		expect(read.tags.map((tag) => tag.id)).toEqual([tagC.id]);
	});

	test("Should change the category of the caller's own post", async () => {
		const category = await ctx.createCategory({ name: "Backend" });
		const post = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).update({
			id: post.id,
			categoryId: category.id,
		});

		expect(result.categoryId).toEqual(category.id);
	});

	test("Should update the cover image of the caller's own post", async () => {
		const post = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).update({
			id: post.id,
			coverImageUrl: "https://example.com/cover.png",
		});

		expect(result.coverImageUrl).toEqual("https://example.com/cover.png");
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
