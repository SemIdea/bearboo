import { isControllerContext, TestContext } from "@/test/context";
import { describe, expect, test } from "vitest";
import { readUserFromSessionController } from "./readUserFromSession";

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
