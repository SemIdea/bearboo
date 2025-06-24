import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { readPostController } from "./controller";
import { PostEntity } from "@/server/entities/post/entity";
import { isControllerContext, TestContext } from "@/test/context";
import { PostErrorCode } from "@/shared/error/post";

describe("Read Post Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should read a post by ID", async () => {
    const postId = await ctx.generateSnowflakeUuid();
    const post = await PostEntity.create({
      id: postId,
      data: {
        title: "Test Post",
        content: "This is a test post.",
        userId: ctx.user.id
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.post
      }
    });

    const result = await readPostController({
      ctx,
      input: {
        postId: post.id
      }
    });

    expect(result).toEqual(post);
  });

  test("Should throw an error if post does not exist", async () => {
    const postId = await ctx.generateSnowflakeUuid();

    await expect(
      readPostController({
        ctx,
        input: {
          postId
        }
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: PostErrorCode.POST_NOT_FOUND
      })
    );
  });
});
