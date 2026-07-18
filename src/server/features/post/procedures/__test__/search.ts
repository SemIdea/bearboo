import { describe, expect, test } from "vitest";
import { createAuthenticatedContext } from "@/test/context";
import { PostRouter } from "../../index";

describe("Search Posts Controller Unitary Testing", () => {
	test("Should find a post by a term present in the title", async () => {
		const ctx = await createAuthenticatedContext();
		const match = await ctx.createPost({ title: "Guide to Prisma" });
		await ctx.createPost({ title: "Unrelated post" });

		const result = await PostRouter.createCaller(ctx).search({
			query: "prisma",
		});

		expect(result.posts.map((post) => post.id)).toEqual([match.id]);
	});

	test("Should find a post by a term present only in the content", async () => {
		const ctx = await createAuthenticatedContext();
		const match = await ctx.createPost({
			title: "Some title",
			content: "This post explains tsvector in depth.",
		});
		await ctx.createPost({ content: "Nothing relevant here." });

		const result = await PostRouter.createCaller(ctx).search({
			query: "tsvector",
		});

		expect(result.posts.map((post) => post.id)).toEqual([match.id]);
	});

	test("Should be case-insensitive", async () => {
		const ctx = await createAuthenticatedContext();
		const match = await ctx.createPost({ title: "Guide to PRISMA" });

		const result = await PostRouter.createCaller(ctx).search({
			query: "prisma",
		});

		expect(result.posts.map((post) => post.id)).toEqual([match.id]);
	});

	test("Should exclude draft and archived posts from the search results", async () => {
		const ctx = await createAuthenticatedContext();
		await ctx.createPost({ title: "Secret draft", status: "DRAFT" });
		await ctx.createPost({ title: "Secret archive", status: "ARCHIVED" });

		const result = await PostRouter.createCaller(ctx).search({
			query: "secret",
		});

		expect(result.posts).toHaveLength(0);
	});

	test("Should filter search results by categoryId", async () => {
		const ctx = await createAuthenticatedContext();
		const category = await ctx.createCategory({ name: "Backend" });
		const inCategory = await ctx.createPost({
			title: "Match in category",
			categoryId: category.id,
		});
		await ctx.createPost({ title: "Match outside category" });

		const result = await PostRouter.createCaller(ctx).search({
			query: "match",
			categoryId: category.id,
		});

		expect(result.posts.map((post) => post.id)).toEqual([inCategory.id]);
	});

	test("Should filter search results by tagId", async () => {
		const ctx = await createAuthenticatedContext();
		const tag = await ctx.createTag({ name: "prisma" });
		const tagged = await ctx.createPost({
			title: "Match tagged",
			tagIds: [tag.id],
		});
		await ctx.createPost({ title: "Match untagged" });

		const result = await PostRouter.createCaller(ctx).search({
			query: "match",
			tagId: tag.id,
		});

		expect(result.posts.map((post) => post.id)).toEqual([tagged.id]);
	});

	test("Should paginate search results", async () => {
		const ctx = await createAuthenticatedContext();
		const post1 = await ctx.createPost({ title: "Paginate test 1" });
		const post2 = await ctx.createPost({ title: "Paginate test 2" });
		const post3 = await ctx.createPost({ title: "Paginate test 3" });

		const caller = PostRouter.createCaller(ctx);

		const firstPage = await caller.search({ query: "paginate", limit: 2 });
		expect(firstPage.posts).toHaveLength(2);
		expect(firstPage.nextCursor).not.toBeNull();

		const secondPage = await caller.search({
			query: "paginate",
			limit: 2,
			cursor: firstPage.nextCursor ?? undefined,
		});
		expect(secondPage.posts).toHaveLength(1);
		expect(secondPage.nextCursor).toBeNull();

		const seenIds = [...firstPage.posts, ...secondPage.posts]
			.map((post) => post.id)
			.sort();
		expect(seenIds).toEqual([post1.id, post2.id, post3.id].sort());
	});

	test("Should reject a query shorter than 2 characters", async () => {
		const ctx = await createAuthenticatedContext();

		await expect(
			PostRouter.createCaller(ctx).search({ query: "a" }),
		).rejects.toThrow();
	});

	test("Should order search results by most viewed when sortBy is mostViewed", async () => {
		const ctx = await createAuthenticatedContext();
		const lessViewed = await ctx.createPost({
			title: "Sort test low views",
			viewCount: 5,
		});
		const moreViewed = await ctx.createPost({
			title: "Sort test high views",
			viewCount: 20,
		});

		const result = await PostRouter.createCaller(ctx).search({
			query: "sort test",
			sortBy: "mostViewed",
		});

		expect(result.posts.map((post) => post.id)).toEqual([
			moreViewed.id,
			lessViewed.id,
		]);
	});

	test("Should paginate consistently when sortBy is mostViewed and results tie", async () => {
		const ctx = await createAuthenticatedContext();
		const posts = [];
		for (let i = 0; i < 3; i += 1) {
			posts.push(
				await ctx.createPost({ title: `Tie test ${i}`, viewCount: 0 }),
			);
		}

		const caller = PostRouter.createCaller(ctx);

		const firstPage = await caller.search({
			query: "tie test",
			sortBy: "mostViewed",
			limit: 2,
		});
		expect(firstPage.posts).toHaveLength(2);
		expect(firstPage.nextCursor).not.toBeNull();

		const secondPage = await caller.search({
			query: "tie test",
			sortBy: "mostViewed",
			limit: 2,
			cursor: firstPage.nextCursor ?? undefined,
		});
		expect(secondPage.posts).toHaveLength(1);
		expect(secondPage.nextCursor).toBeNull();

		const seenIds = [...firstPage.posts, ...secondPage.posts]
			.map((post) => post.id)
			.sort();
		expect(seenIds).toEqual(posts.map((post) => post.id).sort());
	});
});
