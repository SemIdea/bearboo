import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { AuthErrorCode } from "@/shared/error/auth";
import {
	createAuthenticatedContext,
	createTestContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Own Posts Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should return all of the caller's own posts regardless of status", async () => {
		const draft = await ctx.createPost({ status: "DRAFT" });
		const published = await ctx.createPost({ status: "PUBLISHED" });
		const archived = await ctx.createPost({ status: "ARCHIVED" });

		const result = await PostRouter.createCaller(ctx).readOwn({});

		expect(result.map((p) => p.id).sort()).toEqual(
			[draft.id, published.id, archived.id].sort(),
		);
	});

	test("Should filter by status", async () => {
		const draft = await ctx.createPost({ status: "DRAFT" });
		await ctx.createPost({ status: "PUBLISHED" });

		const result = await PostRouter.createCaller(ctx).readOwn({
			status: "DRAFT",
		});

		expect(result.map((p) => p.id)).toEqual([draft.id]);
	});

	test("Should filter by category", async () => {
		const category = await ctx.createCategory({ name: "Backend" });
		const post = await ctx.createPost({ categoryId: category.id });
		await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readOwn({
			categoryId: category.id,
		});

		expect(result.map((p) => p.id)).toEqual([post.id]);
	});

	test("Should filter by tag", async () => {
		const tag = await ctx.createTag({ name: "prisma" });
		const post = await ctx.createPost({ tagIds: [tag.id] });
		await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readOwn({
			tagId: tag.id,
		});

		expect(result.map((p) => p.id)).toEqual([post.id]);
	});

	test("Should never include another user's posts", async () => {
		const otherUser = await ctx.createNewUser();
		await ctx.createPost({ userId: otherUser.id });
		const own = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readOwn({});

		expect(result.map((p) => p.id)).toEqual([own.id]);
	});

	test("Should throw an error when called without a session", async () => {
		const anonymousCtx = createTestContext();

		await expect(
			PostRouter.createCaller(anonymousCtx).readOwn({}),
		).rejects.toThrowError(
			new TRPCError({
				code: "UNAUTHORIZED",
				message: AuthErrorCode.USER_NOT_LOGGED_IN,
			}),
		);
	});
});
