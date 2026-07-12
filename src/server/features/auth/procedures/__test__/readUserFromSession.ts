import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { AuthRouter } from "../../index";

describe("Read User From Session Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should read user from session successfully", async () => {
		const user = ctx.user;

		const result = await AuthRouter.createCaller(ctx).session.me();

		expect(result).toBeDefined();
		expect(result).toEqual({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				verified: user.verified,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				bio: user.bio,
			},
		});
	});

	test("Should never include session tokens in the response", async () => {
		const result = await AuthRouter.createCaller(ctx).session.me();

		expect(result).not.toHaveProperty("session");
		expect(JSON.stringify(result)).not.toContain(ctx.user.session.accessToken);
		expect(JSON.stringify(result)).not.toContain(ctx.user.session.refreshToken);
	});
});
