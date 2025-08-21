import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import {
  logoutUserFromSessionController,
  readUserFromSessionController,
  refreshSessionController
} from "./controller";
import { SessionEntity } from "@/server/entities/session/entity";
import { ISessionEntity } from "@/server/entities/session/DTO";
import { TRPCError } from "@trpc/server";
import { SessionErrorCode } from "@/shared/error/session";
import { UserErrorCode } from "@/shared/error/user";

describe("Refresh Session Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should refresh session successfully", async () => {
    const user = ctx.user;

    const input = {
      refreshToken: user.session.refreshToken
    };

    await refreshSessionController({
      input,
      ctx
    });

    const result = (await SessionEntity.read({
      id: user.session.id,
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.session
      }
    })) as ISessionEntity;

    expect(result).toBeDefined();
    expect(result.accessToken).not.toBe(user.session.accessToken);
    expect(result.refreshToken).not.toBe(user.session.refreshToken);
    expect(result.userId).toBe(user.id);
  });

  test("Should throw an error if token is invalid", async () => {
    const input = {
      refreshToken: "invalid-token"
    };

    await expect(
      refreshSessionController({
        input,
        ctx
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: SessionErrorCode.INVALID_TOKEN
      })
    );
  });
});

describe("Read User From Session Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should read user from session successfully", async () => {
    const user = ctx.user;

    const result = await readUserFromSessionController({
      ctx
    });

    expect(result).toBeDefined();
    expect(result).toEqual(user);
  });
});

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

    const result = await SessionEntity.read({
      id: session.id,
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.session
      }
    });

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
