import { VerifyTokenEntity } from "@/server/entities/verifyToken/entity";
import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import { resendVerificationEmailController } from "./resendVerificationEmail";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";

describe("Resend Verification Email Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should resend verification email successfully", async () => {
    const oldTokenId = ctx.helpers.uid.generate();

    await VerifyTokenEntity.create({
      id: oldTokenId,
      data: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        token: ctx.helpers.uid.generate(),
        userId: ctx.user.id,
        used: false
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.verifyToken
      }
    });

    const input = {
      email: ctx.user.email
    };

    const result = await resendVerificationEmailController({
      input,
      ctx
    });

    const oldToken = await VerifyTokenEntity.read({
      id: oldTokenId,
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.verifyToken
      }
    });

    expect(oldToken).toBeNull();
    expect(result).toBeDefined();
  });

  test("Should throw error if user email is not found", async () => {
    const input = {
      email: "nonexistent@example.com"
    };

    await expect(
      resendVerificationEmailController({
        input,
        ctx
      })
    ).rejects.toThrow(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUND
      })
    );
  });
});
