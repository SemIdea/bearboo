import { beforeEach, describe, expect, test } from "vitest";
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

	test("Should not change the status of a post via update", async () => {
		const post = await ctx.createPost({ status: "PUBLISHED" });

		const result = await PostRouter.createCaller(ctx).update({
			id: post.id,
			title: "Updated Title",
		});

		expect(result.status).toEqual("PUBLISHED");
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

	test("Should update the slug of the caller's own post and keep the previous one", async () => {
		const post = await ctx.createPost({ slug: "titulo-original" });

		const result = await PostRouter.createCaller(ctx).update({
			id: post.id,
			slug: "titulo-corrigido",
		});

		expect(result.slug).toEqual("titulo-corrigido");
		expect(result.previousSlug).toEqual("titulo-original");
	});

	test("Should update the SEO overrides of the caller's own post", async () => {
		const post = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).update({
			id: post.id,
			seoTitle: "Custom SEO title",
			seoDescription: "Custom SEO description",
			canonicalUrl: "https://example.com/original",
		});

		expect(result.seoTitle).toEqual("Custom SEO title");
		expect(result.seoDescription).toEqual("Custom SEO description");
		expect(result.canonicalUrl).toEqual("https://example.com/original");
	});

	test("Should throw error if post does not exist", async () => {
		await expect(
			PostRouter.createCaller(ctx).update({
				id: "non-existent-id",
				content: "Updated Content",
				title: "Updated Title",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Post not found.",
		});
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
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to update this post.",
		});
	});

	test("Should allow an admin to update a post they do not own", async () => {
		const adminCtx = await createAuthenticatedContext({ role: "ADMIN" });
		const post = await adminCtx.createPost({ userId: ctx.user.id });

		const result = await PostRouter.createCaller(adminCtx).update({
			id: post.id,
			content: "Updated by admin",
			title: "Updated by admin",
		});

		expect(result.content).toEqual("Updated by admin");
	});

	test("Should allow an editor to update a post they do not own", async () => {
		const editorCtx = await createAuthenticatedContext({ role: "EDITOR" });
		const post = await editorCtx.createPost({ userId: ctx.user.id });

		const result = await PostRouter.createCaller(editorCtx).update({
			id: post.id,
			content: "Updated by editor",
			title: "Updated by editor",
		});

		expect(result.content).toEqual("Updated by editor");
	});
});
