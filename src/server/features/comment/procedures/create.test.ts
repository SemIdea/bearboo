import { describe, expect, test } from "vitest";
import { CommentRouter } from "../index";
import { isControllerContext, TestContext } from "@/test/context";

describe("Create Comment Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should create a comment successfully", async () => {
    const user = ctx.user;

    const postId = ctx.helpers.uid.generate();

    await ctx.repositories.post.create(postId, {
      title: "Test Post",
      content: "This is a test post.",
      userId: user.id
    });

    const input = {
      postId,
      content: "This is a test comment."
    };

    const result = await CommentRouter.createCaller(ctx).create(input);

    expect(result).toBeDefined();
    expect(result.content).toEqual(input.content);
    expect(result.postId).toEqual(input.postId);
    expect(result.userId).toEqual(user.id);
  });
});
