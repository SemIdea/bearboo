import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import {
  resetPasswordController,
  sendResetPasswordEmailController
} from "./controller";
import { ResetTokenEntity } from "@/server/entities/resetToken/entity";
import { UserErrorCode } from "@/shared/error/user";
import { ResetTokenErrorCodes } from "@/shared/error/resetToken";
import { TRPCError } from "@trpc/server";

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

describe("Reset Token Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

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

  test("Should throw an error if reset token is invalid", async () => {
    const input = {
      token: "invalid-token",
      password: "NewPassword1234",
      confirmPassword: "NewPassword1234"
    };

    await expect(
      resetPasswordController({
        input,
        ctx
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: ResetTokenErrorCodes.TOKEN_NOT_FOUND
      })
    );
  });

  test("Should throw an error if token is already used", async () => {
    const resetToken = await ResetTokenEntity.create({
      id: ctx.helpers.uid.generate(),
      data: {
        userId: ctx.user.id,
        token: ctx.helpers.uid.generate(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: true
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.resetToken
      }
    });

    const input = {
      token: resetToken.token,
      password: "NewPassword1234",
      confirmPassword: "NewPassword1234"
    };

    await expect(
      resetPasswordController({
        input,
        ctx
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "FORBIDDEN",
        message: ResetTokenErrorCodes.TOKEN_ALREADY_USED
      })
    );
  });

  test("Should throw an error if token is expired", async () => {
    const resetToken = await ResetTokenEntity.create({
      id: ctx.helpers.uid.generate(),
      data: {
        userId: ctx.user.id,
        token: ctx.helpers.uid.generate(),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        used: false
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.resetToken
      }
    });

    const input = {
      token: resetToken.token,
      password: "NewPassword1234",
      confirmPassword: "NewPassword1234"
    };

    await expect(
      resetPasswordController({
        input,
        ctx
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "FORBIDDEN",
        message: ResetTokenErrorCodes.TOKEN_EXPIRED
      })
    );
  });

  test("Should throw an error if passwords do not match", async () => {
    const resetToken = await ResetTokenEntity.create({
      id: ctx.helpers.uid.generate(),
      data: {
        userId: ctx.user.id,
        token: ctx.helpers.uid.generate(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: false
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.resetToken
      }
    });

    const input = {
      token: resetToken.token,
      password: "NewPassword1234",
      confirmPassword: "DifferentPassword1234"
    };

    await expect(
      resetPasswordController({
        input,
        ctx
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "BAD_REQUEST",
        message: UserErrorCode.PASSWORDS_DO_NOT_MATCH
      })
    );
  });
});
