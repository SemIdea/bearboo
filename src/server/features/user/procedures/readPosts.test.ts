import { beforeEach, describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { UserRouter } from "../index";
import {
  createAuthenticatedContext,
  IControllerContextDTO
} from "@/test/context";
import { UserErrorCode } from "@/shared/error/user";

describe("User Posts Controller Unitary Testing", () => {
  let ctx: IControllerContextDTO;

  beforeEach(async () => {
    ctx = await createAuthenticatedContext();
  });

  test("Should return an empty list when user has no posts", async () => {
    const result = await UserRouter.createCaller(ctx).readPosts({
      id: ctx.user.id
    });

    expect(result).toBeDefined();
    expect(result).toEqual([]);
  });

  test("Should return all posts from a user", async () => {
    const posts = [];
    for (let i = 0; i < 10; i++) {
      posts.push(
        await ctx.createPost({
          title: `Test Post ${i + 1}`,
          content: `This is test post number ${i + 1}`
        })
      );
    }

    const result = await UserRouter.createCaller(ctx).readPosts({
      id: ctx.user.id
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(10);
    expect(result.map((post) => post.id)).toEqual(posts.map((post) => post.id));
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
