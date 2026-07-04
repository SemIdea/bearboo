import {
  createAuthenticatedContext,
  IControllerContextDTO
} from "@/test/context";
import { beforeEach, describe, expect, test } from "vitest";
import { AuthRouter } from "../index";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";

describe("Resend Verification Email Controller Unitary Testing", () => {
  let ctx: IControllerContextDTO;

  beforeEach(async () => {
    ctx = await createAuthenticatedContext();
  });

  test("Should resend verification email successfully", async () => {
    const oldTokenId = ctx.helpers.uid.generate();

    await ctx.repositories.verifyToken.create(oldTokenId, {
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      token: ctx.helpers.uid.generate(),
      userId: ctx.user.id,
      used: false
    });

    const result = await AuthRouter.createCaller(ctx).resendVerificationEmail({
      email: ctx.user.email
    });

    const oldToken = await ctx.repositories.verifyToken.read(oldTokenId);

    expect(oldToken).toBeNull();
    expect(result).toBeDefined();
  });

  test("Should throw error if user email is not found", async () => {
    await expect(
      AuthRouter.createCaller(ctx).resendVerificationEmail({
        email: "nonexistent@example.com"
      })
    ).rejects.toThrow(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUND
      })
    );
  });
});
