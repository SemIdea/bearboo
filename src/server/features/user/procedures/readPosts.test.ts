import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { UserRouter } from "../index";
import { isControllerContext, TestContext } from "@/test/context";
import { UserErrorCode } from "@/shared/error/user";

describe("User Posts Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  const user = ctx.user;

  test("Should return an empty list when user has no posts", async () => {
    const result = await UserRouter.createCaller(ctx).readPosts({
      id: user.id
    });

    expect(result).toBeDefined();
    expect(result).toEqual([]);
  });

  test("Should return all posts from a user", async () => {
    const postIds: string[] = [];
    for (let i = 0; i < 10; i++) {
      const postId = ctx.helpers.uid.generate();
      postIds.push(postId);

      await ctx.repositories.post.create(postId, {
        title: `Test Post ${i + 1}`,
        content: `This is test post number ${i + 1}`,
        userId: user.id
      });
    }

    const result = await UserRouter.createCaller(ctx).readPosts({
      id: user.id
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(10);
    expect(result.map((post) => post.id)).toEqual(postIds);
  });

  test("Should throw an error if user does not exist", async () => {
    const uuid = ctx.helpers.uid.generate();

    await expect(
      UserRouter.createCaller(ctx).readPosts({ id: uuid })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUND
      })
    );
  });
});
