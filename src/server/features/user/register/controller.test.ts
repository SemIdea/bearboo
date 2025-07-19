import { describe, expect, test, vi } from "vitest";

import { registerUserController } from "./controller";
import { TestContext } from "@/test/context";
import { gateways } from "@/server/container/gateways";

vi.mock("../../mail/service", () => ({
  SendMailService: vi.fn().mockResolvedValue({ success: true })
}));

describe("Register User Controller Unitary Testing", () => {
  const ctx = { ...new TestContext(), gateways };

  test("Should register user successfully", async () => {
    const uuid = ctx.helpers.uid.generate();
    const input = {
      email: `${uuid}@example.com`,
      name: "Test User",
      password: "password123"
    };

    const result = await registerUserController({ input, ctx });

    expect(result).toBeTruthy();
    expect(result.user).toBeDefined();
    expect(result.user.email).toEqual(input.email);
    expect(result.user.name).toEqual(input.name);
    expect(result.user.verified).toBe(false);
    expect("password" in result.user).toBe(false);
  });

  test("Should handle email sending failure gracefully", async () => {
    const { SendMailService } = await import("../../mail/service");
    vi.mocked(SendMailService).mockRejectedValueOnce(
      new Error("Email service unavailable")
    );

    const uuid = ctx.helpers.uid.generate();
    const input = {
      email: `${uuid}@example.com`,
      name: "Test User 3",
      password: "password123"
    };

    await expect(registerUserController({ input, ctx })).rejects.toThrow(
      "Failed to send verification email"
    );
  });
});
