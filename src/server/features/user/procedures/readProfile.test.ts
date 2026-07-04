import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { UserRouter } from "../index";
import { isControllerContext, TestContext } from "@/test/context";
import { UserErrorCode } from "@/shared/error/user";

describe("Read Profile User Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should return user profile", async () => {
    const user = ctx.user;

    const result = await UserRouter.createCaller(ctx).read({ id: user.id });

    expect(result).toBeTruthy();
    expect(result.id).toEqual(user.id);
  });

  test("Should throw error if user does not exist", async () => {
    const uuid = ctx.helpers.uid.generate();

    await expect(
      UserRouter.createCaller(ctx).read({ id: uuid })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUND
      })
    );
  });
});
