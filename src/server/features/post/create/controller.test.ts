import { describe, expect, test } from "vitest";
import { createPostController } from "./controller";
import { passwordHashingHelper } from "@/server/drivers/repositories";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { testContext } from "@/test/context";

describe("Create Post Controller Unitary Testing", () => {
  const ctx = testContext();

  test("Should create a post successfully", async () => {
    const userId = await GenerateSnowflakeUID();
    const userInput = {
      email: `${userId}example.com`,
      password: "password123",
    };

    await ctx.repositories.user.create(userId, {
      ...userInput,
      password: await passwordHashingHelper.hash(userInput.password),
    });

    const sessionId = await GenerateSnowflakeUID();
    const accesToken = await GenerateSnowflakeUID();
    const refreshToken = await GenerateSnowflakeUID();

    const session = await ctx.repositories.session.create(sessionId, {
      userId,
      accessToken: accesToken,
      refreshToken: refreshToken,
    });

    const input = {
      title: "Test Post",
      content: "This is a test post content.",
    };

    const result = await createPostController({
      input,
      ctx: {
        ...ctx,
        user: {
          id: userId,
          email: userInput.email,
          session,
        },
        repositories: {
          ...ctx.repositories,
          post: ctx.repositories.post,
        },
      },
    });

    expect(result).toBeDefined();
    expect(result.title).toEqual(input.title);
    expect(result.content).toEqual(input.content);
    expect(result.userId).toEqual(userId);
  });
});
