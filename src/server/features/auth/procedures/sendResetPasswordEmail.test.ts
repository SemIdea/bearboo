import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import { sendResetPasswordEmailController } from "./sendResetPasswordEmail";
import { UserErrorCode } from "@/shared/error/user";

describe("Send Reset Password Email Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should create a reset token and send a reset token email", async () => {
    const input = {
      email: ctx.user.email
    };

    const result = await sendResetPasswordEmailController({
      input,
      ctx
    });

    const resetToken = await ctx.repositories.resetToken.readByUserId(
      ctx.user.id
    );

    expect(resetToken).toBeDefined();
    expect(resetToken?.userId).toBe(ctx.user.id);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  test("Should throw an error if user does not exist", async () => {
    const input = {
      email: "nonexistent@example.com"
    };

    await expect(
      sendResetPasswordEmailController({
        input,
        ctx
      })
    ).rejects.toThrowError(UserErrorCode.USER_NOT_FOUND);
  });
});
