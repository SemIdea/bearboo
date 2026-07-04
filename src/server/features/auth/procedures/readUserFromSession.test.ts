import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import { AuthRouter } from "../index";

describe("Read User From Session Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should read user from session successfully", async () => {
    const user = ctx.user;

    const result = await AuthRouter.createCaller(ctx).session.me();

    const { truePassword, password, ...userWithoutPassword } = user;
    const { userId, ...sessionWithoutUserId } = user.session;

    expect(result).toBeDefined();
    expect(result).toEqual({
      ...userWithoutPassword,
      session: sessionWithoutUserId
    });
  });
});
