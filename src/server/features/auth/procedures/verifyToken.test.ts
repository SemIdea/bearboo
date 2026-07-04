import {
  createAuthenticatedContext,
  IControllerContextDTO
} from "@/test/context";
import { beforeEach, describe, expect, test } from "vitest";
import { AuthRouter } from "../index";
import { VerifyTokenErrorCodes } from "@/shared/error/verifyToken";

describe("Verify Token Controller Unitary Testing", () => {
  let ctx: IControllerContextDTO;

  beforeEach(async () => {
    ctx = await createAuthenticatedContext();
  });

  test("Should verify token successfully", async () => {
    const verifyTokenId = ctx.helpers.uid.generate();
    const verifyToken = ctx.helpers.uid.generate();

    await ctx.repositories.verifyToken.create(verifyTokenId, {
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      token: verifyToken,
      userId: ctx.user.id,
      used: false
    });

    const result = await AuthRouter.createCaller(ctx).verify({
      token: verifyToken
    });

    const updatedUser = await ctx.repositories.user.read(ctx.user.id);

    expect(result).toBeDefined();
    expect(result.used).toBe(true);
    expect(updatedUser?.verified).toBe(true);
  });

  test("Should throw error if token is not found", async () => {
    await expect(
      AuthRouter.createCaller(ctx).verify({ token: "nonexistent-token" })
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

    await expect(
      AuthRouter.createCaller(ctx).verify({ token: verifyToken.token })
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

    await expect(
      AuthRouter.createCaller(ctx).verify({ token: expiredToken.token })
    ).rejects.toThrow(VerifyTokenErrorCodes.TOKEN_EXPIRED);
  });
});
