import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { PostErrorCode } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Post By Slug Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should read a post by slug", async () => {
		const post = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readBySlug({
			slug: post.slug,
		});

		expect(result).toEqual({ ...post, category: null, tags: [] });
	});

	test("Should include the category and tags of the post", async () => {
		const category = await ctx.createCategory({ name: "Backend" });
		const tag = await ctx.createTag({ name: "prisma" });
		const post = await ctx.createPost({
			categoryId: category.id,
			tagIds: [tag.id],
		});

		const result = await PostRouter.createCaller(ctx).readBySlug({
			slug: post.slug,
		});

		expect(result.category).toEqual(category);
		expect(result.tags).toEqual([tag]);
	});

	test("Should throw an error if slug does not exist", async () => {
		await expect(
			PostRouter.createCaller(ctx).readBySlug({ slug: "does-not-exist" }),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			}),
		);
	});

	test("Should throw not found for a draft post read by slug", async () => {
		const post = await ctx.createPost({ status: "DRAFT" });

		await expect(
			PostRouter.createCaller(ctx).readBySlug({ slug: post.slug }),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			}),
		);
	});

	test("Should throw not found for an archived post read by slug", async () => {
		const post = await ctx.createPost({ status: "ARCHIVED" });

		await expect(
			PostRouter.createCaller(ctx).readBySlug({ slug: post.slug }),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			}),
		);
	});
});
