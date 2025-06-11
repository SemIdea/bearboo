import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { deletePostController } from "./controller";
import { isControllerContext, TestContext } from "@/test/context";
import { PostEntity } from "@/server/entities/post/entity";
import { PostErrorCode } from "@/shared/error/post";

describe("Delete Post Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should delete a post successfully", async () => {
    const postId = await ctx.generateSnowflakeUuid();
    const post = await PostEntity.create({
      id: postId,
      data: {
        title: "Test Post",
        content: "This is a test post.",
        userId: ctx.user.id,
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.post,
      },
    });

    await deletePostController({
      ctx,
      input: {
        postId: post.id,
      },
    });

    const result = await ctx.repositories.post.find(post.id);

    expect(result).toBeNull();
  });

  test("Should throw an error if post does not exist", async () => {
    const postId = await ctx.generateSnowflakeUuid();

    await expect(
      deletePostController({
        ctx,
        input: {
          postId,
        },
      }),
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: PostErrorCode.POST_NOT_FOUND,
      }),
    );
  });
});
