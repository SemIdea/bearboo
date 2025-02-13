import { describe, it, expect, test } from "vitest";
import { registerUserController } from "./controller";
import { CreateUserInput } from "@/server/schema/user.schema";

describe("Register User Controller Unitary Testing", () => {
  test("should return user email and password", () => {
    const input: CreateUserInput = {
      email: "test@example.com",
      password: "password123",
    };

    const result = registerUserController({ input });

    expect(result).toEqual(input);
  });
});
