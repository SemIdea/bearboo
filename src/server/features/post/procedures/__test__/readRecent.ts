import { describe, expect, test } from "vitest";
import { createAuthenticatedContext } from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Recent Posts Controller Unitary Testing", () => {
	test("Should return the recent posts capped at the default page size", async () => {
		const ctx = await createAuthenticatedContext();

		const result = await PostRouter.createCaller(ctx).readRecent();

		expect(result.posts.length).toBeLessThanOrEqual(10);
		expect(result).toHaveProperty("nextCursor");
	});

	test("Should return a nextCursor when there are more posts than the limit", async () => {
		const ctx = await createAuthenticatedContext();
		await ctx.createPost();
		await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readRecent({
			limit: 1,
		});

		expect(result.posts).toHaveLength(1);
		expect(result.nextCursor).not.toBeNull();
	});

	test("Should paginate through all posts without repeating or skipping any", async () => {
		const ctx = await createAuthenticatedContext();
		const post1 = await ctx.createPost();
		const post2 = await ctx.createPost();
		const post3 = await ctx.createPost();

		const caller = PostRouter.createCaller(ctx);

		const firstPage = await caller.readRecent({ limit: 2 });
		expect(firstPage.posts).toHaveLength(2);
		expect(firstPage.nextCursor).not.toBeNull();

		const secondPage = await caller.readRecent({
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

	test("Should return a null nextCursor when the last page is reached", async () => {
		const ctx = await createAuthenticatedContext();
		await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readRecent({
			limit: 50,
		});

		expect(result.nextCursor).toBeNull();
	});

	test("Should exclude draft and archived posts from the recent feed", async () => {
		const ctx = await createAuthenticatedContext();
		const published = await ctx.createPost({ status: "PUBLISHED" });
		await ctx.createPost({ status: "DRAFT" });
		await ctx.createPost({ status: "ARCHIVED" });

		const result = await PostRouter.createCaller(ctx).readRecent({
			limit: 50,
		});

		expect(result.posts.map((post) => post.id)).toEqual([published.id]);
	});
});
