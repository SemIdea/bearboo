import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import {
  logoutUserFromSessionController,
  refreshSessionController
} from "./controller";
import { SessionEntity } from "@/server/entities/session/entity";
import { ISessionEntity } from "@/server/entities/session/DTO";

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
});
