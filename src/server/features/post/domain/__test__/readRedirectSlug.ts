import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { domain_readRedirectSlug } from "../readRedirectSlug";

describe("domain_readRedirectSlug", () => {
	test("resolves an old slug to the post's current slug", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		await ctx.createPost({
			userId: user.id,
			slug: "como-fiz-x-de-verdade",
			previousSlug: "como-fiz-x",
		});

		const result = await domain_readRedirectSlug({
			ctx,
			input: { slug: "como-fiz-x" },
		});

		expect(result).toEqual({ slug: "como-fiz-x-de-verdade" });
	});

	test("returns null when the slug is not a known previous slug", async () => {
		const ctx = createTestContext();

		const result = await domain_readRedirectSlug({
			ctx,
			input: { slug: "slug-que-nao-existe" },
		});

		expect(result).toBeNull();
	});
});
