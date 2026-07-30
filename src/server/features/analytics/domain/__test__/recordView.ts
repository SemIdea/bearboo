import { describe, expect, test } from "vitest";
import { DomainError } from "@/shared/error/domainError";
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

		await expect(
			domain_recordView({
				ctx,
				input: { postId: post.id, visitorId: "visitor-1" },
			}),
		).rejects.toMatchObject(new DomainError("post.not_found"));
	});

	test("does not record a view for an ARCHIVED post", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "ARCHIVED" });

		await expect(
			domain_recordView({
				ctx,
				input: { postId: post.id, visitorId: "visitor-1" },
			}),
		).rejects.toMatchObject(new DomainError("post.not_found"));
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

	test("resolves the referrer bucket and forwards the raw user agent to the buffered event", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "PUBLISHED" });

		await domain_recordView({
			ctx,
			input: {
				postId: post.id,
				visitorId: "visitor-1",
				referer: "https://www.google.com/search?q=x",
				userAgent: "some-agent",
			},
		});

		const events = await ctx.gateways.viewCounter.drainPendingEvents();

		expect(events[post.id]).toEqual([
			{ referrerBucket: "SEARCH", userAgent: "some-agent" },
		]);
	});

	test("defaults to a DIRECT referrer bucket and empty user agent when none is provided", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		const post = await ctx.createPost({ userId: user.id, status: "PUBLISHED" });

		await domain_recordView({
			ctx,
			input: { postId: post.id, visitorId: "visitor-1" },
		});

		const events = await ctx.gateways.viewCounter.drainPendingEvents();

		expect(events[post.id]).toEqual([
			{ referrerBucket: "DIRECT", userAgent: "" },
		]);
	});
});
