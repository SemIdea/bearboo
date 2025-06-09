import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { getUserProfileController } from "./controller";
import { testContext } from "@/test/context/";
import { AuthErrorCode } from "@/shared/error/auth";

describe("Register User Controller Unitary Testing", () => {
  const ctx = testContext();

  test("Should return user profile if user exists", async () => {
    const uuid = await ctx.repositories.uuid();
    const input = {
      email: `${uuid}@example.com`,
      password: "password123",
    };

    await ctx.repositories.user.create(uuid, input);

    const result = await getUserProfileController({
      input: {
        userId: uuid,
      },
      ctx,
    });

    expect(result).toBeTruthy();
    expect(result.id).toEqual(uuid);
  });

  test("Should throw error if user does not exist", async () => {
    const uuid = await ctx.repositories.uuid();

    await expect(
      getUserProfileController({
        input: {
          userId: uuid,
        },
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
