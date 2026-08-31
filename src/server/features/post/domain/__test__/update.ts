import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { domain_updatePost } from "../update";

describe("domain_updatePost", () => {
	test("changing the slug moves the previous slug into previousSlug", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, slug: "como-fiz-x" });

		const updated = await domain_updatePost({
			ctx,
			input: {
				id: post.id,
				slug: "como-fiz-x-de-verdade",
				userId: user.id,
				role: "AUTHOR",
			},
		});

		expect(updated.slug).toBe("como-fiz-x-de-verdade");
		expect(updated.previousSlug).toBe("como-fiz-x");
	});

	test("changing the slug to one that collides gets a numeric suffix", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		await ctx.createPost({ userId: user.id, slug: "titulo-legal" });
		const post = await ctx.createPost({
			userId: user.id,
			slug: "outro-titulo",
		});

		const updated = await domain_updatePost({
			ctx,
			input: {
				id: post.id,
				slug: "titulo-legal",
				userId: user.id,
				role: "AUTHOR",
			},
		});

		expect(updated.slug).toBe("titulo-legal-2");
	});

	test("not passing slug leaves slug and previousSlug untouched", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, slug: "como-fiz-x" });

		const updated = await domain_updatePost({
			ctx,
			input: {
				id: post.id,
				title: "Novo título",
				userId: user.id,
				role: "AUTHOR",
			},
		});

		expect(updated.slug).toBe("como-fiz-x");
		expect(updated.previousSlug).toBeNull();
	});

	test("passing the same slug as today is a no-op for slug/previousSlug", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, slug: "como-fiz-x" });

		const updated = await domain_updatePost({
			ctx,
			input: {
				id: post.id,
				slug: "como-fiz-x",
				userId: user.id,
				role: "AUTHOR",
			},
		});

		expect(updated.slug).toBe("como-fiz-x");
		expect(updated.previousSlug).toBeNull();
	});

	test("sets seoTitle/seoDescription/canonicalUrl when provided", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id });

		const updated = await domain_updatePost({
			ctx,
			input: {
				id: post.id,
				seoTitle: "Título de SEO",
				seoDescription: "Descrição de SEO",
				canonicalUrl: "https://example.com/original-post",
				userId: user.id,
				role: "AUTHOR",
			},
		});

		expect(updated.seoTitle).toBe("Título de SEO");
		expect(updated.seoDescription).toBe("Descrição de SEO");
		expect(updated.canonicalUrl).toBe("https://example.com/original-post");
	});

	test("normalizes empty string overrides back to null (clears them)", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({
			userId: user.id,
			seoTitle: "Título antigo",
			seoDescription: "Descrição antiga",
			canonicalUrl: "https://example.com/old",
		});

		const updated = await domain_updatePost({
			ctx,
			input: {
				id: post.id,
				seoTitle: "",
				seoDescription: "",
				canonicalUrl: "",
				userId: user.id,
				role: "AUTHOR",
			},
		});

		expect(updated.seoTitle).toBeNull();
		expect(updated.seoDescription).toBeNull();
		expect(updated.canonicalUrl).toBeNull();
	});
});
