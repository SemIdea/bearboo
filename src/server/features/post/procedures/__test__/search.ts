import { describe, expect, test } from "vitest";
import { createAuthenticatedContext } from "@/test/context";
import { PostRouter } from "../../index";

// Native full-text search (ADR-0027) runs raw tsvector SQL that prisma-mock has
// no engine for, so the matching/ranking/filter/pagination cases moved to
// `src/server/features/post/__itest__/search.integration.ts` (real Postgres).
// What stays here is the boundary validation, which Zod rejects before any query
// runs (rule 16) — no database needed.
describe("Search Posts Controller — boundary validation", () => {
	test("Should reject a query shorter than 2 characters", async () => {
		const ctx = await createAuthenticatedContext();

		await expect(
			PostRouter.createCaller(ctx).search({ query: "a" }),
		).rejects.toThrow();
	});
});
