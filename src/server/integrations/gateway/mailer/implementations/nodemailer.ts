import nodemailer from "nodemailer";
import { IMailerGatewayAdapter, ISendMailReq } from "../adapter";

type INodeMailerConfig = {
	smtpHost: string;
	smtpPort: number;
	domain: string;
	from: string;
	fromPass: string;
};

class NodeMailerGateway implements IMailerGatewayAdapter {
	constructor(private readonly config: INodeMailerConfig) {}

	async sendMail({ body, subject, to }: ISendMailReq) {
		const transporter = nodemailer.createTransport({
			host: this.config.smtpHost,
			port: this.config.smtpPort,
			secure: false,
			auth: {
				user: `${this.config.from}@${this.config.domain}`,
				pass: this.config.fromPass,
			},
		});

		const { pending, rejected, accepted } = await transporter.sendMail({
			from: `${this.config.from}@${this.config.domain}`,
			to,
			subject,
			html: body,
		});

		return {
			status: true,
			pending: pending as string[],
			accepted: accepted as string[],
			rejected: rejected as string[],
		};
	}
}

export type { INodeMailerConfig };
export { NodeMailerGateway };
