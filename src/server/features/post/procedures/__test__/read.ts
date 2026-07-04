import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test } from "vitest";
import { PostErrorCode } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

describe("Read Post Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should read a post by ID", async () => {
		const post = await ctx.createPost();

		const result = await PostRouter.createCaller(ctx).read({ id: post.id });

		expect(result).toEqual(post);
	});

	test("Should throw an error if post does not exist", async () => {
		const id = ctx.helpers.uid.generate();

		await expect(
			PostRouter.createCaller(ctx).read({ id }),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: PostErrorCode.POST_NOT_FOUND,
			}),
		);
	});
});
