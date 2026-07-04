import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import { refreshSessionController } from "./refreshSession";
import { ISessionEntity } from "@/server/models/session";
import { TRPCError } from "@trpc/server";
import { SessionErrorCode } from "@/shared/error/session";

describe("Refresh Session Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should refresh session successfully", async () => {
    const user = ctx.user;

    const input = {
      refreshToken: user.session.refreshToken
    };

    await refreshSessionController({
      input,
      ctx
    });

    const result = (await ctx.repositories.session.read(
      user.session.id
    )) as ISessionEntity;

    expect(result).toBeDefined();
    expect(result.accessToken).not.toBe(user.session.accessToken);
    expect(result.refreshToken).not.toBe(user.session.refreshToken);
    expect(result.userId).toBe(user.id);
  });

  test("Should throw an error if token is invalid", async () => {
    const input = {
      refreshToken: "invalid-token"
    };

    await expect(
      refreshSessionController({
        input,
        ctx
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: SessionErrorCode.INVALID_TOKEN
      })
    );
  });
});
