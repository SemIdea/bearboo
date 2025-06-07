import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { loginUserController } from "./controller";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { testContext } from "@/test/context";
import { AuthErrorCode } from "@/shared/error/auth";

describe("Login User Controller Unitary Testing", () => {
  const ctx = testContext();

  test("Should return a session if valid credentials", async () => {
    const uuid = await GenerateSnowflakeUID();
    const user = {
      email: `${uuid}@example.com`,
      password: "password123",
    };

    await ctx.repositories.user.create(uuid, {
      ...user,
      password: await ctx.repositories.hashing.hash(user.password),
    });

    const result = await loginUserController({
      input: user,
      ctx,
    });

    expect(result).toBeDefined();
    expect(result.user.id).toEqual(uuid);

    const session = await ctx.repositories.session.find(result.id);

    expect(session).toBeDefined();
    expect(session!.userId).toEqual(uuid);
  });

  test("Should throw an error if user does not exist", async () => {
    const uuid = await GenerateSnowflakeUID();
    const user = {
      email: `${uuid}@example.com`,
      password: "password123",
    };

    await expect(
      loginUserController({ input: user, ctx }),
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: AuthErrorCode.USER_NOT_FOUD,
      }),
    );
  });
});
