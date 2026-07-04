import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { PostRouter } from "../index";
import { isControllerContext, TestContext } from "@/test/context";
import { PostErrorCode } from "@/shared/error/post";

describe("Read Post Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should read a post by ID", async () => {
    const id = ctx.helpers.uid.generate();
    const post = await ctx.repositories.post.create(id, {
      title: "Test Post",
      content: "This is a test post.",
      userId: ctx.user.id
    });

    const result = await PostRouter.createCaller(ctx).read({ id });

    expect(result).toEqual(post);
  });

  test("Should throw an error if post does not exist", async () => {
    const id = ctx.helpers.uid.generate();

    await expect(
      PostRouter.createCaller(ctx).read({ id })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: PostErrorCode.POST_NOT_FOUND
      })
    );
  });
});
