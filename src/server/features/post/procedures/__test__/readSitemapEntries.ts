import { describe, expect, test } from "vitest";
import { createAuthenticatedContext } from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Sitemap Entries Controller Unitary Testing", () => {
	test("Should return slug and updatedAt for a published post", async () => {
		const ctx = await createAuthenticatedContext();
		const published = await ctx.createPost({ status: "PUBLISHED" });

		const result = await PostRouter.createCaller(ctx).readSitemapEntries();

		expect(result).toContainEqual({
			slug: published.slug,
			updatedAt: published.updatedAt,
		});
	});

	test("Should exclude draft, in-review and archived posts", async () => {
		const ctx = await createAuthenticatedContext();
		await ctx.createPost({ status: "DRAFT" });
		await ctx.createPost({ status: "IN_REVIEW" });
		await ctx.createPost({ status: "ARCHIVED" });

		const result = await PostRouter.createCaller(ctx).readSitemapEntries();

		expect(result).toHaveLength(0);
	});

	test("Should include a scheduled post whose date has already passed", async () => {
		const ctx = await createAuthenticatedContext();
		const past = await ctx.createPost({
			status: "SCHEDULED",
			scheduledAt: new Date(Date.now() - 60_000),
		});

		const result = await PostRouter.createCaller(ctx).readSitemapEntries();

		expect(result.map((entry) => entry.slug)).toContain(past.slug);
	});

	test("Should exclude a scheduled post whose date is still in the future", async () => {
		const ctx = await createAuthenticatedContext();
		const future = await ctx.createPost({
			status: "SCHEDULED",
			scheduledAt: new Date(Date.now() + 60_000),
		});

		const result = await PostRouter.createCaller(ctx).readSitemapEntries();

		expect(result.map((entry) => entry.slug)).not.toContain(future.slug);
	});
});
