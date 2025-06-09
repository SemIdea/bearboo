import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { getUserProfileController } from "./controller";
import { AuthErrorCode } from "@/shared/error/auth";
import { isControllerContext, TestContext } from "@/test/context";

describe("Register User Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should return user profile if user exists", async () => {
    const user = ctx.user;

    const result = await getUserProfileController({
      ctx,
      input: {
        userId: user.id,
      },
    });

    expect(result).toBeTruthy();
    expect(result.id).toEqual(user.id);
  });

  test("Should throw error if user does not exist", async () => {
    const uuid = await ctx.generateSnowflakeUuid();

    await expect(
      getUserProfileController({
        ctx,
        input: {
          userId: uuid,
        },
      }),
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: AuthErrorCode.USER_NOT_FOUD,
      }),
    );
  });
});
