import { describe, expect, test } from "vitest";
import { PostRouter } from "../index";
import { createTestContext } from "@/test/context";

describe("Read Recent Posts Controller Unitary Testing", () => {
  const ctx = createTestContext();

  test("Should return the recent posts", async () => {
    const result = await PostRouter.createCaller(ctx).readRecent();

    expect(result).toBeDefined();
    expect(result.length).toBeLessThanOrEqual(30);
  });
});
