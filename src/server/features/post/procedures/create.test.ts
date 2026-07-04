import { beforeEach, describe, expect, test } from "vitest";
import { PostRouter } from "../index";
import {
  createAuthenticatedContext,
  IControllerContextDTO
} from "@/test/context";

describe("Create Post Controller Unitary Testing", () => {
  let ctx: IControllerContextDTO;

  beforeEach(async () => {
    ctx = await createAuthenticatedContext();
  });

  test("Should create a post successfully", async () => {
    const user = ctx.user;
    const input = {
      title: "Test Post",
      content: "This is a test post content."
    };

    const result = await PostRouter.createCaller(ctx).create(input);

    expect(result).toBeDefined();
    expect(result.title).toEqual(input.title);
    expect(result.content).toEqual(input.content);
    expect(result.userId).toEqual(user.id);
  });
});
