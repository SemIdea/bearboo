import { describe, expect, test } from "vitest";
import { createCommentController } from "./controller";
import { isControllerContext, TestContext } from "@/test/context";
import { PostEntity } from "@/server/entities/post/entity";

describe("Create Comment Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should create a comment successfully", async () => {
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

    const input = {
      postId,
      content: "This is a test comment."
    };

    const result = await createCommentController({
      ctx,
      input
    });

    expect(result).toBeDefined();
    expect(result.content).toEqual(input.content);
    expect(result.postId).toEqual(input.postId);
    expect(result.userId).toEqual(user.id);
  });
});
