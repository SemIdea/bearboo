import { beforeEach, describe, expect, test } from "vitest";
import { UserRouter } from "../index";
import {
  createAuthenticatedContext,
  IControllerContextDTO
} from "@/test/context";

describe("Update Profile User Controller Unitary Testing", () => {
  let ctx: IControllerContextDTO;

  beforeEach(async () => {
    ctx = await createAuthenticatedContext();
  });

  test("Should update user profile", async () => {
    const user = ctx.user;

    const result = await UserRouter.createCaller(ctx).update({
      name: "New Name",
      email: `new${user.id}email@example.com`,
      bio: "New bio"
    });

    expect(result).toBeTruthy();
    expect(result.id).toEqual(user.id);
    expect(result.name).toEqual("New Name");
    expect(result.email).toEqual(`new${user.id}email@example.com`);
    expect(result.bio).toEqual("New bio");
  });
});
