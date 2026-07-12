import { IRole } from "@/server/models/user";
import { createTestContext } from "./createTestContext";
import { isControllerContext } from "./isControllerContext";
import { IControllerContextDTO } from "./types";

async function createAuthenticatedContext(
	overrides: { role?: IRole } = {},
): Promise<IControllerContextDTO> {
	const ctx = createTestContext();
	await ctx.createAuthenticatedUser(overrides);

	if (!isControllerContext(ctx)) {
		throw new Error("User is not authenticated");
	}

	return ctx;
}

export { createAuthenticatedContext };
