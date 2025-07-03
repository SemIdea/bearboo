import { CommentEntity } from "@/server/entities/comment/entity";
import { PostEntity } from "@/server/entities/post/entity";
import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import { readUserCommentsController } from "./controller";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";

describe("User Comments Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should return an empty array if user has no comments", async () => {
    const user = ctx.user;

    const result = await readUserCommentsController({
      ctx,
      input: {
        id: user.id
      }
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(0);
  });

  test("Should read user comments successfully", async () => {
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
    const comment = await CommentEntity.create({
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

    const result = await readUserCommentsController({
      ctx,
      input: {
        id: user.id
      }
    });

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].id).toEqual(comment.id);
    expect(result[0].content).toEqual(comment.content);
    expect(result[0].postId).toEqual(postId);
    expect(result[0].userId).toEqual(user.id);
  });

  test("Should return an error if user does not exist", async () => {
    const userId = ctx.helpers.uid.generate();

    await expect(
      readUserCommentsController({
        ctx,
        input: {
          id: userId
        }
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUD
      })
    );
  });
});
