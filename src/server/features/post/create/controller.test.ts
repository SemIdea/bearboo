import { describe, expect, test } from "vitest";
import { createPostController } from "./controller";
import { testContext } from "@/test/context";

describe("Create Post Controller Unitary Testing", () => {
  const ctx = testContext();

  test("Should create a post successfully", async () => {
    const { user, session } = await ctx.createAuthenticatedUser();
    const input = {
      title: "Test Post",
      content: "This is a test post content.",
    };

    const result = await createPostController({
      input,
      ctx: ctx.createAuthenticatedContext({
        ctx,
        session,
        user,
      }),
    });

    expect(result).toBeDefined();
    expect(result.title).toEqual(input.title);
    expect(result.content).toEqual(input.content);
    expect(result.userId).toEqual(user.id);
  });
});
