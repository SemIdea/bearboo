import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { getUserPostsController } from "./controller";
import { isControllerContext, TestContext } from "@/test/context";
import { PostEntity } from "@/server/entities/post/entity";
import { UserErrorCode } from "@/shared/error/user";

describe("User Posts Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  const user = ctx.user;

  test("Should return an empty list when user has no posts", async () => {
    const result = await getUserPostsController({
      ctx,
      input: { id: user.id }
    });

    expect(result).toBeDefined();
    expect(result).toEqual([]);
  });

  test("Should return all posts from a user", async () => {
    const postId = await ctx.generateSnowflakeUuid();

    await PostEntity.create({
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.post
      },
      id: postId,
      data: {
        title: "Test Post",
        content: "This is a test post",
        userId: user.id
      }
    });

    const result = await getUserPostsController({
      ctx,
      input: { id: user.id }
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(postId);
  });

  test("Should throw an error if user does not exist", async () => {
    const uuid = await ctx.generateSnowflakeUuid();

    await expect(
      getUserPostsController({
        ctx,
        input: { id: uuid }
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUD
      })
    );
  });
});
