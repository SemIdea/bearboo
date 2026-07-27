import { beforeEach, describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { FakeMailerGateway } from "@/test/gateways/mail";
import { AuthRouter } from "../../index";

describe("Resend Verification Email Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should resend verification email successfully", async () => {
		const oldTokenId = ctx.helpers.uid.generate();

		await ctx.repositories.verifyToken.create(oldTokenId, {
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			token: ctx.helpers.uid.generate(),
			userId: ctx.user.id,
			used: false,
		});

		const result = await AuthRouter.createCaller(ctx).resendVerificationEmail({
			email: ctx.user.email,
		});

		const oldToken = await ctx.repositories.verifyToken.read(oldTokenId);

		expect(oldToken).toBeNull();
		expect(result).toBeDefined();
	});

	test("Should send verification link as a path param, not a query param", async () => {
		const oldTokenId = ctx.helpers.uid.generate();

		await ctx.repositories.verifyToken.create(oldTokenId, {
			expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			token: ctx.helpers.uid.generate(),
			userId: ctx.user.id,
			used: false,
		});

		await AuthRouter.createCaller(ctx).resendVerificationEmail({
			email: ctx.user.email,
		});

		const mailGateway = ctx.gateways.mail as FakeMailerGateway;
		const [sentMail] = mailGateway.sentMails;

		expect(sentMail.body).toMatch(/\/auth\/verify\/[^"?\s]+/);
		expect(sentMail.body).not.toContain("/auth/verify?token=");
	});

	test("Should throw error if user email is not found", async () => {
		await expect(
			AuthRouter.createCaller(ctx).resendVerificationEmail({
				email: "nonexistent@example.com",
			}),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "User not found. Please check the email.",
		});
	});
});
