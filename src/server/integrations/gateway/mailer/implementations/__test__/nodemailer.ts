import { beforeEach, describe, expect, test, vi } from "vitest";
import { NodeMailerGateway } from "../nodemailer";

const sendMailMock = vi.hoisted(() => vi.fn());
const createTransportMock = vi.hoisted(() =>
	vi.fn(() => ({
		sendMail: sendMailMock,
	})),
);

vi.mock("nodemailer", () => ({
	default: {
		createTransport: createTransportMock,
	},
}));

describe("NodeMailerGateway", () => {
	beforeEach(() => {
		createTransportMock.mockClear();
		sendMailMock.mockReset();
	});

	test("builds an SMTP transporter and maps sendMail result", async () => {
		sendMailMock.mockResolvedValue({
			accepted: ["to@example.com"],
			rejected: [],
			pending: [],
		});

		const gateway = new NodeMailerGateway({
			smtpHost: "smtp.example.com",
			smtpPort: 587,
			domain: "example.com",
			from: "noreply",
			fromPass: "secret",
		});

		const result = await gateway.sendMail({
			to: "to@example.com",
			subject: "Subject",
			body: "<strong>Body</strong>",
		});

		expect(createTransportMock).toHaveBeenCalledWith({
			host: "smtp.example.com",
			port: 587,
			secure: false,
			auth: {
				user: "noreply@example.com",
				pass: "secret",
			},
		});
		expect(sendMailMock).toHaveBeenCalledWith({
			from: "noreply@example.com",
			to: "to@example.com",
			subject: "Subject",
			html: "<strong>Body</strong>",
		});
		expect(result).toEqual({
			status: true,
			accepted: ["to@example.com"],
			rejected: [],
			pending: [],
		});
	});
});
