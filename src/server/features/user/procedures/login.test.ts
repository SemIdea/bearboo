import { beforeEach, describe, expect, test } from "vitest";
import { TRPCError } from "@trpc/server";
import { UserRouter } from "../index";
import {
  createAuthenticatedContext,
  IControllerContextDTO
} from "@/test/context";
import { UserErrorCode } from "@/shared/error/user";

describe("Login User Controller Unitary Testing", () => {
  let ctx: IControllerContextDTO;

  beforeEach(async () => {
    ctx = await createAuthenticatedContext();
  });

  test("Should return a session if valid credentials", async () => {
    const user = ctx.user;

    const result = await UserRouter.createCaller(ctx).login({
      email: user.email,
      password: user.truePassword
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.user.id).toEqual(user.id);
  });

  test("Should throw an error if user does not exist", async () => {
    const uuid = ctx.helpers.uid.generate();

    await expect(
      UserRouter.createCaller(ctx).login({
        email: `${uuid}@example.com`,
        password: "password123"
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUND
      })
    );
  });
});
