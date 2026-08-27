import { describe, expect, test } from "vitest";
import { domain_searchPosts } from "@/server/features/post/domain/search";
import { createTestContext } from "@/test/context";

// Native full-text search against real Postgres (ADR-0027). These exercise
// tsvector matching, ts_rank ordering, and the `portuguese` stemming — none of
// which prisma-mock can run, which is why the search tests live here (feature
// 027 moved them from unit). See docs/features/027.
describe("post.search — native full-text (integration, real Postgres)", () => {
	const search = (
		ctx: ReturnType<typeof createTestContext>,
		input: Parameters<typeof domain_searchPosts>[0]["input"],
	) => domain_searchPosts({ ctx, input });

	test("ranks a title match above a body-only match", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const bodyOnly = await ctx.createPost({
			userId: user.id,
			title: "Some unrelated heading",
			content: "A passing mention of prisma deep in the body.",
		});
		const titleMatch = await ctx.createPost({
			userId: user.id,
			title: "A guide to prisma",
			content: "Nothing else here.",
		});

		const { posts } = await search(ctx, { query: "prisma" });

		expect(posts.map((post) => post.id)).toEqual([titleMatch.id, bodyOnly.id]);
	});

	test("stems Portuguese (programar matches programação)", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const match = await ctx.createPost({
			userId: user.id,
			title: "Introdução à programação",
		});
		await ctx.createPost({ userId: user.id, title: "Receita de bolo" });

		const { posts } = await search(ctx, { query: "programar" });

		expect(posts.map((post) => post.id)).toEqual([match.id]);
	});

	test("excludes draft and archived posts", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		await ctx.createPost({
			userId: user.id,
			title: "Secret roadmap",
			status: "DRAFT",
		});
		await ctx.createPost({
			userId: user.id,
			title: "Old secret",
			status: "ARCHIVED",
		});

		const { posts } = await search(ctx, { query: "secret" });

		expect(posts).toHaveLength(0);
	});

	test("filters by categoryId", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const category = await ctx.createCategory({ name: "Backend" });
		const inCategory = await ctx.createPost({
			userId: user.id,
			title: "Backend testing patterns",
			categoryId: category.id,
		});
		await ctx.createPost({
			userId: user.id,
			title: "Testing without a category",
		});

		const { posts } = await search(ctx, {
			query: "testing",
			categoryId: category.id,
		});

		expect(posts.map((post) => post.id)).toEqual([inCategory.id]);
	});

	test("orders by most viewed when sortBy is mostViewed", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const low = await ctx.createPost({
			userId: user.id,
			title: "Caching low",
			viewCount: 5,
		});
		const high = await ctx.createPost({
			userId: user.id,
			title: "Caching high",
			viewCount: 40,
		});

		const { posts } = await search(ctx, {
			query: "caching",
			sortBy: "mostViewed",
		});

		expect(posts.map((post) => post.id)).toEqual([high.id, low.id]);
	});

	test("paginates by cursor across pages", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const ids: string[] = [];
		for (let i = 0; i < 3; i += 1) {
			const post = await ctx.createPost({
				userId: user.id,
				title: `Pagination sample ${i}`,
			});
			ids.push(post.id);
		}

		const first = await search(ctx, { query: "pagination", limit: 2 });
		expect(first.posts).toHaveLength(2);
		expect(first.nextCursor).not.toBeNull();

		const second = await search(ctx, {
			query: "pagination",
			limit: 2,
			cursor: first.nextCursor ?? undefined,
		});
		expect(second.posts).toHaveLength(1);
		expect(second.nextCursor).toBeNull();

		const seen = [...first.posts, ...second.posts]
			.map((post) => post.id)
			.sort();
		expect(seen).toEqual([...ids].sort());
	});
});
