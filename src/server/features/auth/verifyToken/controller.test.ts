import { VerifyTokenEntity } from "@/server/entities/verifyToken/entity";
import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import {
  resendVerificationEmailController,
  verifyTokenController
} from "./controller";
import { UserEntity } from "@/server/entities/user/entity";
import { VerifyTokenErrorCodes } from "@/shared/error/verifyToken";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";

describe("Verify Token Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should verify token successfully", async () => {
    const verifyTokenId = ctx.helpers.uid.generate();
    const verifyToken = ctx.helpers.uid.generate();

    await VerifyTokenEntity.create({
      id: verifyTokenId,
      data: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        token: verifyToken,
        userId: ctx.user.id,
        used: false
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.verifyToken
      }
    });

    const result = await verifyTokenController({
      input: {
        token: verifyToken
      },
      ctx
    });

    const updatedUser = await UserEntity.read({
      id: ctx.user.id,
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.user
      }
    });

    expect(result).toBeDefined();
    expect(result.used).toBe(true);
    expect(updatedUser?.verified).toBe(true);
  });

  test("Should throw error if token is not found", async () => {
    const input = {
      token: "nonexistent-token"
    };

    await expect(
      verifyTokenController({
        input,
        ctx
      })
    ).rejects.toThrow(VerifyTokenErrorCodes.TOKEN_NOT_FOUND);
  });

  test("Should throw error if token is already used", async () => {
    const verifyToken = await VerifyTokenEntity.create({
      id: ctx.helpers.uid.generate(),
      data: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        token: ctx.helpers.uid.generate(),
        userId: ctx.user.id,
        used: true
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.verifyToken
      }
    });

    const input = {
      token: verifyToken.token
    };

    await expect(
      verifyTokenController({
        input,
        ctx
      })
    ).rejects.toThrow(VerifyTokenErrorCodes.TOKEN_ALREADY_USED);
  });

  test("Should throw error if token is expired", async () => {
    const expiredToken = await VerifyTokenEntity.create({
      id: ctx.helpers.uid.generate(),
      data: {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
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
      token: expiredToken.token
    };

    await expect(
      verifyTokenController({
        input,
        ctx
      })
    ).rejects.toThrow(VerifyTokenErrorCodes.TOKEN_EXPIRED);
  });
});

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
