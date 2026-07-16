import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { domain_recordView } from "../recordView";

describe("domain_recordView", () => {
	test("records a view for a PUBLISHED post", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "PUBLISHED" });

		const result = await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-1" },
		});

		expect(result).toEqual({ counted: true });
	});

	test("does not record a view for a DRAFT post", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "DRAFT" });

		const result = await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-1" },
		});

		expect(result).toBeNull();
	});

	test("does not record a view for an ARCHIVED post", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "ARCHIVED" });

		const result = await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-1" },
		});

		expect(result).toBeNull();
	});

	test("does not recount the same visitor on a second call", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "PUBLISHED" });

		const first = await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-1" },
		});
		const second = await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-1" },
		});

		expect(first).toEqual({ counted: true });
		expect(second).toEqual({ counted: false });
	});
});
