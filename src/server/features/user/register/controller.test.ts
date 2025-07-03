import { describe, expect, test } from "vitest";

import { registerUserController } from "./controller";
import { TestContext } from "@/test/context";

describe("Register User Controller Unitary Testing", () => {
  const ctx = new TestContext();

  test("Should verify if user is registered", async () => {
    const uuid = ctx.helpers.uid.generate();
    const input = {
      email: `${uuid}@example.com`,
      name: "Test User",
      password: "password123"
    };

    const result = await registerUserController({ input, ctx });

    expect(result).toBeTruthy();
    expect(result.user.email).toEqual(input.email);
    expect(result.user.name).toEqual(input.name);
  });
});
