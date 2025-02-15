import { describe, expect, test } from "vitest";

import { CreateUserInput } from "../../../schema/user.schema";

import { registerUserController } from "./controller";

describe("Register User Controller Unitary Testing", () => {
  test("should return user email and password", async () => {
    const input: CreateUserInput = {
      email: `${Date.now().toString()}@example.com`,
      password: "password123",
    };

    const result = await registerUserController({ input });

    expect(result.id).toBeTruthy();
  });

  // test("should handle validation errors", () => {
  //   const input: CreateUserInput = {
  //     email: "invalid-email",
  //     password: "short",
  //   };

  //   expect(() => registerUserController({ input })).toThrowError("Validation failed");
  // });
});
