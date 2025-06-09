import { describe, expect, test } from "vitest";
import { createPostController } from "./controller";
import { isControllerContext, TestContext } from "@/test/context";

describe("Create Post Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should create a post successfully", async () => {
    const user = ctx.user;
    const input = {
      title: "Test Post",
      content: "This is a test post content.",
    };

    const result = await createPostController({
      ctx,
      input,
    });

    expect(result).toBeDefined();
    expect(result.title).toEqual(input.title);
    expect(result.content).toEqual(input.content);
    expect(result.userId).toEqual(user.id);
  });
});
