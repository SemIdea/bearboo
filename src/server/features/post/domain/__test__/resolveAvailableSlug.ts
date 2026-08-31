import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { domain_resolveAvailableSlug } from "../resolveAvailableSlug";

describe("domain_resolveAvailableSlug", () => {
	test("returns the base slug when it is available", async () => {
		const ctx = createTestContext();

		const result = await domain_resolveAvailableSlug({
			ctx,
			input: { baseSlug: "como-fiz-x" },
		});

		expect(result).toBe("como-fiz-x");
	});

	test("returns a numeric-suffixed slug when the base slug collides", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		await ctx.createPost({ userId: user.id, slug: "como-fiz-x" });

		const result = await domain_resolveAvailableSlug({
			ctx,
			input: { baseSlug: "como-fiz-x" },
		});

		expect(result).toBe("como-fiz-x-2");
	});

	test("keeps incrementing the suffix past multiple collisions", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		await ctx.createPost({ userId: user.id, slug: "como-fiz-x" });
		await ctx.createPost({ userId: user.id, slug: "como-fiz-x-2" });

		const result = await domain_resolveAvailableSlug({
			ctx,
			input: { baseSlug: "como-fiz-x" },
		});

		expect(result).toBe("como-fiz-x-3");
	});

	test("ignores a collision with the post being excluded (edit own slug back to itself)", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, slug: "como-fiz-x" });

		const result = await domain_resolveAvailableSlug({
			ctx,
			input: { baseSlug: "como-fiz-x", excludePostId: post.id },
		});

		expect(result).toBe("como-fiz-x");
	});
});
