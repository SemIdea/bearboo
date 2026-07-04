import {
  createAuthenticatedContext,
  IControllerContextDTO
} from "@/test/context";
import { beforeEach, describe, expect, test } from "vitest";
import { AuthRouter } from "../index";
import { ISessionEntity } from "@/server/models/session";
import { TRPCError } from "@trpc/server";
import { SessionErrorCode } from "@/shared/error/session";

describe("Refresh Session Controller Unitary Testing", () => {
  let ctx: IControllerContextDTO;

  beforeEach(async () => {
    ctx = await createAuthenticatedContext();
  });

  test("Should refresh session successfully", async () => {
    const user = ctx.user;

    await AuthRouter.createCaller(ctx).refreshSession({
      refreshToken: user.session.refreshToken
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
    await expect(
      AuthRouter.createCaller(ctx).refreshSession({
        refreshToken: "invalid-token"
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: SessionErrorCode.INVALID_TOKEN
      })
    );
  });
});
