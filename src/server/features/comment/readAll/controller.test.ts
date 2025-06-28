import { describe, expect, test } from "vitest";
import { readAllCommentsByPostController } from "./controller";
import { CommentEntity } from "@/server/entities/comment/entity";
import { PostEntity } from "@/server/entities/post/entity";
import { isControllerContext, TestContext } from "@/test/context";

describe("Read All Comments Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should read all comments successfully", async () => {
    const user = ctx.user;

    const postId = ctx.generateSnowflakeUuid();

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

    const commentId = ctx.generateSnowflakeUuid();
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

    const input = {
      postId
    };

    const result = await readAllCommentsByPostController({
      ctx,
      input
    });

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toEqual(comment.id);
    expect(result[0].content).toEqual(comment.content);
    expect(result[0].postId).toEqual(postId);
    expect(result[0].userId).toEqual(user.id);
  });

  test("Should return an empty array if no comments exist for the post", async () => {
    const user = ctx.user;

    const postId = ctx.generateSnowflakeUuid();

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

    const input = {
      postId
    };

    const result = await readAllCommentsByPostController({
      ctx,
      input
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(0);
  });
});
