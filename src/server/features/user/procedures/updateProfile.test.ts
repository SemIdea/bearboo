import { describe, expect, test } from "vitest";
import { updateUserProfileController } from "./updateProfile";
import { isControllerContext, TestContext } from "@/test/context";

describe("Update Profile User Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should update user profile", async () => {
    const user = ctx.user;

    const result = await updateUserProfileController({
      ctx,
      input: {
        name: "New Name",
        email: `new${user.id}email@example.com`,
        bio: "New bio"
      }
    });

    expect(result).toBeTruthy();
    expect(result.id).toEqual(user.id);
    expect(result.name).toEqual("New Name");
    expect(result.email).toEqual(`new${user.id}email@example.com`);
    expect(result.bio).toEqual("New bio");
  });
});
