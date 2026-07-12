import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { PostErrorCode } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Post By Slug Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should read a post by slug", async () => {
		const post = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).readBySlug({
			slug: post.slug,
		});

		expect(result).toEqual(post);
	});

	test("Should throw an error if slug does not exist", async () => {
		await expect(
			PostRouter.createCaller(ctx).readBySlug({ slug: "does-not-exist" }),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			}),
		);
	});
});
