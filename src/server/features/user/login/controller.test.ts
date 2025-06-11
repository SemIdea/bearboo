import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { loginUserController } from "./controller";
import { isControllerContext, TestContext } from "@/test/context";
import { UserErrorCode } from "@/shared/error/user";

describe("Login User Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should return a session if valid credentials", async () => {
    const user = ctx.user;

    const result = await loginUserController({
      ctx,
      input: {
        email: user.email,
        password: user.truePassword,
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.user.id).toEqual(user.id);
  });

  test("Should throw an error if user does not exist", async () => {
    const uuid = await ctx.generateSnowflakeUuid();
    const userData = {
      email: `${uuid}@example.com`,
      password: "password123",
    };

    await expect(
      loginUserController({ input: userData, ctx }),
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUD,
      }),
    );
  });
});
