import { describe, expect, test } from "vitest";
import { updateCommentController } from "./controller";
import { CommentEntity } from "@/server/entities/comment/entity";
import { PostEntity } from "@/server/entities/post/entity";
import { isControllerContext, TestContext } from "@/test/context";

describe("Update Comment Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should update a comment successfully", async () => {
    const user = ctx.user;

    const postId = ctx.helpers.uid.generate();
    const post = await PostEntity.create({
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
        content: "This is a test comment.",
        postId: post.id,
        userId: user.id
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.comment
      }
    });

    const input = {
      id: comment.id,
      content: "This is an updated test comment."
    };

    const result = await updateCommentController({
      ctx,
      input
    });

    expect(result).toBeDefined();
    expect(result.id).toEqual(comment.id);
    expect(result.content).toEqual(input.content);
    expect(result.postId).toEqual(post.id);
    expect(result.userId).toEqual(user.id);
  });
});
