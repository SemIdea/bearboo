import { describe, expect, test } from "vitest";
import { createTestContext } from "@/test/context";
import { FakeMailerGateway } from "@/test/gateways/mail";
import { domain_sendMail } from "../sendMail";
import { domain_sendMailByUserId } from "../sendMailByUserId";

describe("mail domain", () => {
	test("sends direct mail through the configured gateway", async () => {
		const ctx = createTestContext();

		const result = await domain_sendMail({
			ctx,
			input: {
				to: ["first@example.com", "second@example.com"],
				subject: "Subject",
				body: "<p>Hello</p>",
			},
		});

		const mailGateway = ctx.gateways.mail as FakeMailerGateway;

		expect(result).toEqual({
			status: true,
			accepted: ["first@example.com", "second@example.com"],
			rejected: [],
			pending: [],
		});
		expect(mailGateway.sentMails).toEqual([
			{
				to: ["first@example.com", "second@example.com"],
				subject: "Subject",
				body: "<p>Hello</p>",
			},
		]);
	});

	test("sends templated mail to a user by id", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();

		await domain_sendMailByUserId({
			ctx,
			input: {
				userId: user.id,
				subject: "Welcome",
				body: "Hello {{name}} from {{unknown}}",
			},
		});

		const mailGateway = ctx.gateways.mail as FakeMailerGateway;

		expect(mailGateway.sentMails).toEqual([
			{
				to: user.email,
				subject: "Welcome",
				body: "Hello Test User from ",
			},
		]);
	});

	test("throws when trying to send mail to a missing user", async () => {
		const ctx = createTestContext();

		await expect(
			domain_sendMailByUserId({
				ctx,
				input: {
					userId: "missing-user",
					subject: "Subject",
					body: "Body",
				},
			}),
		).rejects.toThrow("User not found");
	});
});
