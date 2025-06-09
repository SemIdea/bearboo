import { beforeAll, describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { getUserPostsController } from "./controller";
import { testContext } from "@/test/context";
import { AuthErrorCode } from "@/shared/error/auth";

describe("User Posts Controller Unitary Testing", () => {
  const ctx = testContext();
  var userId: string;

  beforeAll(async () => {
    userId = await ctx.repositories.uuid();
    const user = {
      email: `${userId}@example.com`,
      password: "password123",
    };

    await ctx.repositories.user.create(userId, {
      ...user,
      password: await ctx.repositories.hashing.hash(user.password),
    });
  });

  test("Should return an empty list when user has no posts", async () => {
    const result = await getUserPostsController({
      input: { userId },
      ctx,
    });

    expect(result).toBeDefined();
    expect(result).toEqual([]);
  });

  test("Should return all posts from a user", async () => {
    const postId = await ctx.repositories.uuid();

    await ctx.repositories.post.create(postId, {
      userId,
      title: `Post one`,
      content: `Content of post one`,
    });

    const result = await getUserPostsController({
      input: { userId },
      ctx,
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(postId);
  });

  test("Should throw an error if user does not exist", async () => {
    const uuid = await ctx.repositories.uuid();

    await expect(
      getUserPostsController({
        input: { userId: uuid },
        ctx,
      }),
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: AuthErrorCode.USER_NOT_FOUD,
      }),
    );
  });
});
