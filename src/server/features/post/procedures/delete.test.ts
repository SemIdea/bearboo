import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { PostRouter } from "../index";
import { isControllerContext, TestContext } from "@/test/context";
import { PostErrorCode } from "@/shared/error/post";

describe("Delete Post Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should delete a post successfully", async () => {
    const id = ctx.helpers.uid.generate();
    await ctx.repositories.post.create(id, {
      title: "Test Post",
      content: "This is a test post.",
      userId: ctx.user.id
    });

    await PostRouter.createCaller(ctx).delete({ id });

    const result = await ctx.repositories.post.read(id);

    expect(result).toBeNull();
  });

  test("Should throw an error if post does not exist", async () => {
    const id = ctx.helpers.uid.generate();

    await expect(
      PostRouter.createCaller(ctx).delete({ id })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: PostErrorCode.POST_NOT_FOUND
      })
    );
  });

  test("Should throw an error if post does not belong to user", async () => {
    const otherUser = await ctx.createNewUser();

    const otherUserPostId = ctx.helpers.uid.generate();
    await ctx.repositories.post.create(otherUserPostId, {
      title: "Other User's Post",
      content: "This post belongs to another user.",
      userId: otherUser.id
    });

    await expect(
      PostRouter.createCaller(ctx).delete({ id: otherUserPostId })
    ).rejects.toThrowError(
      new TRPCError({
        code: "FORBIDDEN",
        message: PostErrorCode.POST_DELETE_FORBIDDEN
      })
    );
  });
});
