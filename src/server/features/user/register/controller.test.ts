import { describe, expect, test } from "vitest";

import { registerUserController } from "./controller";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { testContext } from "@/test/context/";

describe("Register User Controller Unitary Testing", () => {
  const ctx = testContext();

  test("Should verify if user is registered", async () => {
    const uuid = await GenerateSnowflakeUID();
    const input = {
      email: `${uuid}@example.com`,
      password: "password123",
    };

    const result = await registerUserController({ input, ctx });

    expect(result).toBeTruthy();
    expect(result.user.email).toEqual(input.email);
  });
});
