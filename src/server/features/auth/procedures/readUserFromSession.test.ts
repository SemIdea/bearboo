import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { AuthRouter } from "../index";

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
			id: user.id,
			name: user.name,
			email: user.email,
			verified: user.verified,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			bio: user.bio,
			session: {
				id: user.session.id,
				accessToken: user.session.accessToken,
				refreshToken: user.session.refreshToken,
				createdAt: user.session.createdAt,
				updatedAt: user.session.updatedAt,
			},
		});
	});
});
