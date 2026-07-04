import { describe, expect, test } from "vitest";
import { CommentRouter } from "../index";
import { isControllerContext, TestContext } from "@/test/context";

describe("Read All Comments Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should read all comments successfully", async () => {
    const user = ctx.user;

    const postId = ctx.helpers.uid.generate();

    await ctx.repositories.post.create(postId, {
      title: "Test Post",
      content: "This is a test post.",
      userId: user.id
    });

    const commentId = ctx.helpers.uid.generate();
    const comment = await ctx.repositories.comment.create(commentId, {
      postId,
      content: "This is a test comment.",
      userId: user.id
    });

    const input = {
      postId
    };

    const result = await CommentRouter.createCaller(ctx).readAllByPost(input);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toEqual(comment.id);
    expect(result[0].content).toEqual(comment.content);
    expect(result[0].postId).toEqual(postId);
    expect(result[0].userId).toEqual(user.id);
  });

  test("Should return an empty array if no comments exist for the post", async () => {
    const user = ctx.user;

    const postId = ctx.helpers.uid.generate();

    await ctx.repositories.post.create(postId, {
      title: "Test Post",
      content: "This is a test post.",
      userId: user.id
    });

    const input = {
      postId
    };

    const result = await CommentRouter.createCaller(ctx).readAllByPost(input);

    expect(result).toBeDefined();
    expect(result.length).toEqual(0);
  });
});
