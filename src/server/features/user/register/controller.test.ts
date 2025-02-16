import { describe, expect, test } from "vitest";

import { CreateUserInput } from "../../../schema/user.schema";

import { registerUserController } from "./controller";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";

describe("Register User Controller Unitary Testing", () => {
  test("Should verify if user is registered", async () => {
    const uuid = GenerateSnowflakeUID();
    const input: CreateUserInput = {
      email: `${uuid}@example.com`,
      password: "password123",
    };

    const result = await registerUserController({ input });

    expect(result.id).toBeTruthy();
  });
});
