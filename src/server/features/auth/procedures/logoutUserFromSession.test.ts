import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import { logoutUserFromSessionController } from "./logoutUserFromSession";
import { TRPCError } from "@trpc/server";
import { SessionErrorCode } from "@/shared/error/session";
import { UserErrorCode } from "@/shared/error/user";

describe("Logout Session Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should logout user successfully", async () => {
    const user = ctx.user;
    const session = user.session;

    await logoutUserFromSessionController({
      ctx
    });

    const result = await ctx.repositories.session.read(session.id);

    expect(result).toBeNull();
  });

  test("Should throw an error if user is not found", async () => {
    ctx.user.id = "non-existent-user-id";

    await expect(
      logoutUserFromSessionController({
        ctx
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUND
      })
    );
  });

  test("Should throw an error if session is not found", async () => {
    const ctx = new TestContext();
    await ctx.createAuthenticatedUser();

    if (!isControllerContext(ctx)) {
      throw new Error("User is not authenticated");
    }

    ctx.user.session.id = "non-existent-session-id";

    await expect(
      logoutUserFromSessionController({
        ctx
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: SessionErrorCode.SESSION_NOT_FOUND
      })
    );
  });
});
