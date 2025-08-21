import { describe, expect, test } from "vitest";
import { deleteCommentController } from "./controller";
import { CommentEntity } from "@/server/entities/comment/entity";
import { PostEntity } from "@/server/entities/post/entity";
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

    await PostEntity.create({
      id: postId,
      data: {
        title: "Test Post",
        content: "This is a test post.",
        userId: user.id
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.post
      }
    });

    const commentId = ctx.helpers.uid.generate();

    await CommentEntity.create({
      id: commentId,
      data: {
        postId,
        content: "This is a test comment.",
        userId: user.id
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.comment
      }
    });

    const input = {
      id: commentId
    };

    await deleteCommentController({
      ctx,
      input
    });

    const result = await CommentEntity.read({
      id: commentId,
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.comment
      }
    });

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
    const otherUserId = ctx.helpers.uid.generate();

    const postId = ctx.helpers.uid.generate();

    await PostEntity.create({
      id: postId,
      data: {
        title: "Test Post",
        content: "This is a test post.",
        userId: otherUserId
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.post
      }
    });

    const commentId = ctx.helpers.uid.generate();

    await CommentEntity.create({
      id: commentId,
      data: {
        postId,
        content: "This is a test comment.",
        userId: otherUserId
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.comment
      }
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
