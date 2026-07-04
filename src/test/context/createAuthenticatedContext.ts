import { IControllerContextDTO } from "./types";
import { createTestContext } from "./createTestContext";
import { isControllerContext } from "./isControllerContext";

async function createAuthenticatedContext(): Promise<IControllerContextDTO> {
  const ctx = createTestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  return ctx;
}

export { createAuthenticatedContext };
