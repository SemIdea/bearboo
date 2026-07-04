import { describe, expect, test } from "vitest";
import { CommentRouter } from "../index";
import { isControllerContext, TestContext } from "@/test/context";
import { TRPCError } from "@trpc/server";
import { CommentErrorCode } from "@/shared/error/comment";

describe("Update Comment Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should update a comment successfully", async () => {
    const user = ctx.user;

    const postId = ctx.helpers.uid.generate();
    const post = await ctx.repositories.post.create(postId, {
      title: "Test Post",
      content: "This is a test post.",
      userId: user.id
    });

    const commentId = ctx.helpers.uid.generate();
    const comment = await ctx.repositories.comment.create(commentId, {
      content: "This is a test comment.",
      postId: post.id,
      userId: user.id
    });

    const input = {
      id: comment.id,
      content: "This is an updated test comment."
    };

    const result = await CommentRouter.createCaller(ctx).update(input);

    expect(result).toBeDefined();
    expect(result.id).toEqual(comment.id);
    expect(result.content).toEqual(input.content);
    expect(result.postId).toEqual(post.id);
    expect(result.userId).toEqual(user.id);
  });

  test("Should throw an error if the comment does not exist", async () => {
    const input = {
      id: ctx.helpers.uid.generate(),
      content: "This comment does not exist."
    };

    await expect(
      CommentRouter.createCaller(ctx).update(input)
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: CommentErrorCode.COMMENT_NOT_FOUND
      })
    );
  });

  test("Should throw an error if the user is not the owner of the comment", async () => {
    const otherUser = await ctx.createNewUser();

    const postId = ctx.helpers.uid.generate();
    const post = await ctx.repositories.post.create(postId, {
      title: "Test Post",
      content: "This is a test post.",
      userId: otherUser.id
    });

    const commentId = ctx.helpers.uid.generate();
    await ctx.repositories.comment.create(commentId, {
      content: "This is a test comment.",
      postId: post.id,
      userId: otherUser.id
    });

    const input = {
      id: commentId,
      content: "This is an updated test comment."
    };

    await expect(
      CommentRouter.createCaller(ctx).update(input)
    ).rejects.toThrowError(
      new TRPCError({
        code: "FORBIDDEN",
        message: CommentErrorCode.COMMENT_UPDATE_FORBIDDEN
      })
    );
  });
});
