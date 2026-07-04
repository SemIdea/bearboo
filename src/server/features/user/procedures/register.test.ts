import { describe, expect, test, vi } from "vitest";

import { UserRouter } from "../index";
import { TestContext } from "@/test/context";
import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";

vi.mock("../../mail/domain/sendMail", () => ({
  domain_sendMail: vi.fn().mockResolvedValue({ success: true })
}));

describe("Register User Controller Unitary Testing", () => {
  const ctx = new TestContext();

  test("Should register user successfully", async () => {
    const uuid = ctx.helpers.uid.generate();
    const input = {
      email: `${uuid}@example.com`,
      name: "Test User",
      password: "password123"
    };

    const result = await UserRouter.createCaller(ctx).register(input);

    expect(result).toBeTruthy();
    expect(result.user).toBeDefined();
    expect(result.user.email).toEqual(input.email);
    expect(result.user.name).toEqual(input.name);
    expect(result.user.verified).toBe(false);
    expect("password" in result.user).toBe(false);
  });

  test("Should handle email sending failure gracefully", async () => {
    const { domain_sendMail } = await import("../../mail/domain/sendMail");
    vi.mocked(domain_sendMail).mockRejectedValueOnce(
      new Error("Email service unavailable")
    );

    const uuid = ctx.helpers.uid.generate();
    const input = {
      email: `${uuid}@example.com`,
      name: "Test User 3",
      password: "password123"
    };

    await expect(
      UserRouter.createCaller(ctx).register(input)
    ).rejects.toThrow("Failed to send verification email");
  });

  test("Should throw error if user already exists", async () => {
    const otherUser = await ctx.createNewUser();

    const input = {
      email: otherUser.email,
      name: "Existing User",
      password: "password123"
    };

    await expect(
      UserRouter.createCaller(ctx).register(input)
    ).rejects.toThrowError(
      new TRPCError({
        code: "CONFLICT",
        message: UserErrorCode.USER_ALREADY_EXISTS
      })
    );
  });
});
