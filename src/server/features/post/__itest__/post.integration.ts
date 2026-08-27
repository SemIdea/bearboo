import { describe, expect, test } from "vitest";
import { prisma } from "@/server/infra/drivers/prisma";
import { createTestContext } from "@/test/context";

// First integration tests: the real domain/repository layer against a REAL
// Postgres (Testcontainers, ADR-0026). These cover what prisma-mock genuinely
// cannot — running raw SQL and applying the real migrations (the container in
// globalSetup proves the whole migration set applies to postgres:16). Note that
// prisma-mock DOES fake unique constraints and `mode: "insensitive"` correctly
// (verified 2026-08-26), so those are NOT the gap; raw SQL is. See feature 026.
describe("post persistence (integration, real Postgres)", () => {
	test("round-trips a user and a post through real Postgres", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();

		const post = await ctx.createPost({
			userId: user.id,
			title: "Hello Postgres",
			slug: "hello-postgres",
		});

		const read = await ctx.repositories.post.read(post.id);

		expect(read).toMatchObject({
			id: post.id,
			title: "Hello Postgres",
			slug: "hello-postgres",
			userId: user.id,
		});
		expect(read?.createdAt).toBeInstanceOf(Date);
	});

	test("runs the real search query against real SQL", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();

		await ctx.createPost({
			userId: user.id,
			title: "PostgreSQL Tips",
			status: "PUBLISHED",
		});

		const found = await ctx.repositories.post.search("postgresql", 10);

		expect(found.map((post) => post.title)).toContain("PostgreSQL Tips");
	});

	test("executes raw SQL the mock has no engine for ($queryRaw)", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		await ctx.createPost({ userId: user.id, status: "PUBLISHED" });
		await ctx.createPost({ userId: user.id, status: "DRAFT" });

		const rows = await prisma.$queryRaw<Array<{ count: number }>>`
			SELECT count(*)::int AS count FROM "Post" WHERE status = 'PUBLISHED'
		`;

		expect(rows[0].count).toBe(1);
	});

	test("the real engine supports the tsvector primitives native search (027) will use", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();
		await ctx.createPost({
			userId: user.id,
			title: "Full text ranking",
			content: "relevance with tsvector and ts_rank",
			status: "PUBLISHED",
		});

		// to_tsvector / plainto_tsquery simply do not exist under prisma-mock; this
		// proves the seam that unblocks feature 027 (native full-text search).
		const rows = await prisma.$queryRaw<Array<{ title: string }>>`
			SELECT title FROM "Post"
			WHERE to_tsvector('english', title || ' ' || content)
			      @@ plainto_tsquery('english', 'relevance')
		`;

		expect(rows.map((row) => row.title)).toContain("Full text ranking");
	});
});
