import { describe, expect, test } from "vitest";
import { deleteCommentController } from "./delete";
import { isControllerContext, TestContext } from "@/test/context";
import { TRPCError } from "@trpc/server";
import { CommentErrorCode } from "@/shared/error/comment";

describe("Delete Comment Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should delete a comment successfully", async () => {
    const user = ctx.user;

    const postId = ctx.helpers.uid.generate();

    await ctx.repositories.post.create(postId, {
      title: "Test Post",
      content: "This is a test post.",
      userId: user.id
    });

    const commentId = ctx.helpers.uid.generate();

    await ctx.repositories.comment.create(commentId, {
      postId,
      content: "This is a test comment.",
      userId: user.id
    });

    const input = {
      id: commentId
    };

    await deleteCommentController({
      ctx,
      input
    });

    const result = await ctx.repositories.comment.read(commentId);

    expect(result).toBeNull();
  });

  test("Should throw an error when trying to delete a comment that does not exist", async () => {
    const input = {
      id: ctx.helpers.uid.generate()
    };

    await expect(
      deleteCommentController({
        ctx,
        input
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: CommentErrorCode.COMMENT_NOT_FOUND
      })
    );
  });

  test("Should throw an error when trying to delete a comment that belongs to another user", async () => {
    const otherUser = await ctx.createNewUser();

    const postId = ctx.helpers.uid.generate();

    await ctx.repositories.post.create(postId, {
      title: "Test Post",
      content: "This is a test post.",
      userId: otherUser.id
    });

    const commentId = ctx.helpers.uid.generate();

    await ctx.repositories.comment.create(commentId, {
      postId,
      content: "This is a test comment.",
      userId: otherUser.id
    });

    const input = {
      id: commentId
    };

    await expect(
      deleteCommentController({
        ctx,
        input
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "FORBIDDEN",
        message: CommentErrorCode.COMMENT_DELETE_FORBIDDEN
      })
    );
  });
});
