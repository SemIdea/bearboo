import { beforeEach, describe, expect, test } from "vitest";
import { RESET_RATE_LIMIT } from "@/server/features/auth/constants";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { FakeMailerGateway } from "@/test/gateways/mail";
import { AuthRouter } from "../../index";

describe("Send Reset Password Email Controller Unitary Testing", () => {
	let ctx: IControllerContextDTO;

	beforeEach(async () => {
		ctx = await createAuthenticatedContext();
	});

	test("Should create a reset token and send a reset token email", async () => {
		const result = await AuthRouter.createCaller(ctx).sendResetPasswordEmail({
			email: ctx.user.email,
		});

		const resetToken = await ctx.repositories.resetToken.readByUserId(
			ctx.user.id,
		);

		expect(resetToken).toBeDefined();
		expect(resetToken?.userId).toBe(ctx.user.id);
		expect(result).toBeDefined();
		expect(result.success).toBe(true);
	});

	test("Should build the reset link from the configured SITE_URL, not a hardcoded host", async () => {
		ctx.env = { ...ctx.env, siteUrl: "https://bearboo.example" };

		await AuthRouter.createCaller(ctx).sendResetPasswordEmail({
			email: ctx.user.email,
		});

		const resetToken = await ctx.repositories.resetToken.readByUserId(
			ctx.user.id,
		);
		const [sentMail] = (ctx.gateways.mail as FakeMailerGateway).sentMails;

		expect(sentMail.body).toContain(
			`https://bearboo.example/auth/recover/${resetToken?.token}`,
		);
		expect(sentMail.body).not.toContain("localhost");
	});

	test("Should always report success, even when the email doesn't exist", async () => {
		const result = await AuthRouter.createCaller(ctx).sendResetPasswordEmail({
			email: "nonexistent@example.com",
		});

		expect(result).toEqual({ success: true });
	});

	test("Should enforce the reset rate limit", async () => {
		for (let i = 0; i < RESET_RATE_LIMIT.max; i++) {
			await AuthRouter.createCaller(ctx).sendResetPasswordEmail({
				email: "nonexistent@example.com",
			});
		}

		await expect(
			AuthRouter.createCaller(ctx).sendResetPasswordEmail({
				email: "nonexistent@example.com",
			}),
		).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
	});
});
