import { describe, expect, test } from "vitest";
import { createTestContext, ITestContextDTO } from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Redirect Slug Controller Unitary Testing", () => {
	test("Should resolve an old slug to the post's current slug", async () => {
		const ctx: ITestContextDTO = createTestContext();
		const user = await ctx.createNewUser();
		await ctx.createPost({
			userId: user.id,
			slug: "titulo-corrigido",
			previousSlug: "titulo-original",
		});

		const result = await PostRouter.createCaller(ctx).readRedirectSlug({
			slug: "titulo-original",
		});

		expect(result).toEqual({ slug: "titulo-corrigido" });
	});

	test("Should return null when the slug is not a known previous slug", async () => {
		const ctx: ITestContextDTO = createTestContext();

		const result = await PostRouter.createCaller(ctx).readRedirectSlug({
			slug: "slug-que-nao-existe",
		});

		expect(result).toBeNull();
	});
});
