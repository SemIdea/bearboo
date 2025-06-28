import { describe, expect, test } from "vitest";
import { deleteCommentController } from "./controller";
import { CommentEntity } from "@/server/entities/comment/entity";
import { PostEntity } from "@/server/entities/post/entity";
import { isControllerContext, TestContext } from "@/test/context";

describe("Delete Comment Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should delete a comment successfully", async () => {
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
});
