import { describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import {
  readUserProfileController,
  updateUserProfileController
} from "./controller";
import { isControllerContext, TestContext } from "@/test/context";
import { UserErrorCode } from "@/shared/error/user";

describe("Profile User Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should return user profile", async () => {
    const user = ctx.user;

    const result = await readUserProfileController({
      ctx,
      input: {
        id: user.id
      }
    });

    expect(result).toBeTruthy();
    expect(result.id).toEqual(user.id);
  });

  test("Should update user profile", async () => {
    const user = ctx.user;

    const result = await updateUserProfileController({
      ctx,
      input: {
        name: "New Name",
        email: "newemail@example.com",
        bio: "New bio"
      }
    });

    expect(result).toBeTruthy();
    expect(result.id).toEqual(user.id);
    expect(result.name).toEqual("New Name");
    expect(result.email).toEqual("newemail@example.com");
    expect(result.bio).toEqual("New bio");
  });

  test("Should throw error if user does not exist", async () => {
    const uuid = ctx.helpers.uid.generate();

    await expect(
      readUserProfileController({
        ctx,
        input: {
          id: uuid
        }
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUD
      })
    );
  });
});
