import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import { verifyTokenController } from "./verifyToken";
import { VerifyTokenErrorCodes } from "@/shared/error/verifyToken";

describe("Verify Token Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should verify token successfully", async () => {
    const verifyTokenId = ctx.helpers.uid.generate();
    const verifyToken = ctx.helpers.uid.generate();

    await ctx.repositories.verifyToken.create(verifyTokenId, {
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      token: verifyToken,
      userId: ctx.user.id,
      used: false
    });

    const result = await verifyTokenController({
      input: {
        token: verifyToken
      },
      ctx
    });

    const updatedUser = await ctx.repositories.user.read(ctx.user.id);

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
    const verifyToken = await ctx.repositories.verifyToken.create(
      ctx.helpers.uid.generate(),
      {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        token: ctx.helpers.uid.generate(),
        userId: ctx.user.id,
        used: true
      }
    );

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
    const expiredToken = await ctx.repositories.verifyToken.create(
      ctx.helpers.uid.generate(),
      {
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        token: ctx.helpers.uid.generate(),
        userId: ctx.user.id,
        used: false
      }
    );

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
