import { revalidateTag } from "next/cache";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

vi.mock("next/cache", () => ({
	revalidateTag: vi.fn(),
}));

describe("Create Post Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should create a post successfully", async () => {
		const user = ctx.user;
		const input = {
			title: "Test Post",
			content: "This is a test post content.",
		};

		const result = await PostRouter.createCaller(ctx).create(input);

		expect(result).toBeDefined();
		expect(result.title).toEqual(input.title);
		expect(result.content).toEqual(input.content);
		expect(result.userId).toEqual(user.id);
	});

	test("Should revalidate the posts cache tag after creating", async () => {
		await PostRouter.createCaller(ctx).create({
			title: "Test Post",
			content: "This is a test post content.",
		});

		expect(revalidateTag).toHaveBeenCalledWith("posts", "hours");
	});

	test("Should generate a slug derived from the title", async () => {
		const result = await PostRouter.createCaller(ctx).create({
			title: "Como fiz X",
			content: "This is a test post content.",
		});

		expect(result.slug).toEqual("como-fiz-x");
	});

	test("Should append a numeric suffix when the slug already exists", async () => {
		const input = {
			title: "Duplicate Title",
			content: "This is a test post content.",
		};

		const first = await PostRouter.createCaller(ctx).create(input);
		const second = await PostRouter.createCaller(ctx).create(input);

		expect(first.slug).toEqual("duplicate-title");
		expect(second.slug).toEqual("duplicate-title-2");
	});

	test("Should default an Author's post to DRAFT when none is provided", async () => {
		const result = await PostRouter.createCaller(ctx).create({
			title: "Test Post",
			content: "This is a test post content.",
		});

		expect(result.status).toEqual("DRAFT");
	});

	test("Should ignore an explicit status from an Author and force DRAFT", async () => {
		const result = await PostRouter.createCaller(ctx).create({
			title: "Test Post",
			content: "This is a test post content.",
			status: "PUBLISHED",
		});

		expect(result.status).toEqual("DRAFT");
	});

	test("Should default an Admin's post to PUBLISHED when none is provided", async () => {
		const adminCtx = await createAuthenticatedContext({ role: "ADMIN" });

		const result = await PostRouter.createCaller(adminCtx).create({
			title: "Test Post",
			content: "This is a test post content.",
		});

		expect(result.status).toEqual("PUBLISHED");
	});

	test("Should respect an explicit status from an Admin", async () => {
		const adminCtx = await createAuthenticatedContext({ role: "ADMIN" });

		const result = await PostRouter.createCaller(adminCtx).create({
			title: "Test Post",
			content: "This is a test post content.",
			status: "ARCHIVED",
		});

		expect(result.status).toEqual("ARCHIVED");
	});

	test("Should append a numeric suffix when the slug already exists as a draft", async () => {
		const input = {
			title: "Draft Duplicate",
			content: "This is a test post content.",
			status: "DRAFT" as const,
		};

		const first = await PostRouter.createCaller(ctx).create(input);
		const second = await PostRouter.createCaller(ctx).create(input);

		expect(first.slug).toEqual("draft-duplicate");
		expect(second.slug).toEqual("draft-duplicate-2");
	});

	test("Should include a reading time of at least 1 minute", async () => {
		const result = await PostRouter.createCaller(ctx).create({
			title: "Test Post",
			content: "Short content.",
		});

		expect(result.readingTimeMinutes).toBeGreaterThanOrEqual(1);
	});

	test("Should create a post without category or tags when none is provided", async () => {
		const result = await PostRouter.createCaller(ctx).create({
			title: "Test Post",
			content: "This is a test post content.",
		});

		expect(result.categoryId).toBeNull();
	});

	test("Should create a post without a cover image when none is provided", async () => {
		const result = await PostRouter.createCaller(ctx).create({
			title: "Test Post",
			content: "This is a test post content.",
		});

		expect(result.coverImageUrl).toBeNull();
	});

	test("Should persist the cover image URL when provided", async () => {
		const result = await PostRouter.createCaller(ctx).create({
			title: "Test Post",
			content: "This is a test post content.",
			coverImageUrl: "https://example.com/cover.png",
		});

		expect(result.coverImageUrl).toEqual("https://example.com/cover.png");
	});

	test("Should associate an existing category and tags when provided", async () => {
		const category = await ctx.createCategory({ name: "Backend" });
		const tagA = await ctx.createTag({ name: "prisma" });
		const tagB = await ctx.createTag({ name: "trpc" });

		const created = await PostRouter.createCaller(ctx).create({
			title: "Post With Taxonomy",
			content: "This is a test post content.",
			categoryId: category.id,
			tagIds: [tagA.id, tagB.id],
		});

		expect(created.categoryId).toEqual(category.id);

		const read = await PostRouter.createCaller(ctx).readBySlug({
			slug: created.slug,
		});

		expect(read.category?.id).toEqual(category.id);
		expect(read.tags.map((tag) => tag.id).sort()).toEqual(
			[tagA.id, tagB.id].sort(),
		);
	});
});
