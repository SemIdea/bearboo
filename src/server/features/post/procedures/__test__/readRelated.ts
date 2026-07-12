import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Related Posts Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should return posts sharing the same category", async () => {
		const category = await ctx.createCategory({ name: "Backend" });
		const post = await ctx.createPost({ categoryId: category.id });
		const related = await ctx.createPost({ categoryId: category.id });
		await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readRelated({
			postId: post.id,
			categoryId: post.categoryId,
		});

		expect(result.map((p) => p.id)).toEqual([related.id]);
	});

	test("Should return posts sharing at least one tag", async () => {
		const tag = await ctx.createTag({ name: "prisma" });
		const post = await ctx.createPost({ tagIds: [tag.id] });
		const related = await ctx.createPost({ tagIds: [tag.id] });
		await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readRelated({
			postId: post.id,
			tagIds: [tag.id],
		});

		expect(result.map((p) => p.id)).toEqual([related.id]);
	});

	test("Should never include the post itself", async () => {
		const category = await ctx.createCategory({ name: "Backend" });
		const post = await ctx.createPost({ categoryId: category.id });

		const result = await PostRouter.createCaller(ctx).readRelated({
			postId: post.id,
			categoryId: post.categoryId,
		});

		expect(result.map((p) => p.id)).not.toContain(post.id);
	});

	test("Should not include non-PUBLISHED related posts", async () => {
		const category = await ctx.createCategory({ name: "Backend" });
		const post = await ctx.createPost({ categoryId: category.id });
		await ctx.createPost({ categoryId: category.id, status: "DRAFT" });

		const result = await PostRouter.createCaller(ctx).readRelated({
			postId: post.id,
			categoryId: post.categoryId,
		});

		expect(result).toEqual([]);
	});

	test("Should return an empty list when the post has no category or tags", async () => {
		const post = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readRelated({
			postId: post.id,
		});

		expect(result).toEqual([]);
	});
});
