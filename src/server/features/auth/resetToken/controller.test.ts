import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import {
  resetPasswordController,
  sendResetPasswordEmailController
} from "./controller";
import { ResetTokenEntity } from "@/server/entities/resetToken/entity";

describe("Reset Token Controller Unitary Testing", async () => {
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

    const resetToken = await ResetTokenEntity.readByUserId({
      userId: ctx.user.id,
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.resetToken
      }
    });

    expect(resetToken).toBeDefined();
    expect(resetToken?.userId).toBe(ctx.user.id);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  test("Should reset the user password", async () => {
    const email = ctx.user.email;

    await sendResetPasswordEmailController({
      input: {
        email
      },
      ctx
    });

    const resetToken = await ResetTokenEntity.readByUserId({
      userId: ctx.user.id,
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.resetToken
      }
    });

    const input = {
      token: resetToken!.token,
      password: "NewPassword1234",
      confirmPassword: "NewPassword1234"
    };

    const result = await resetPasswordController({
      input,
      ctx
    });

    expect(result).toBeDefined();
    expect(result.password).not.toBe(ctx.user.password);
  });
});
