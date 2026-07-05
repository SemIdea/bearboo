import nodemailer from "nodemailer";
import { ISendMailReq, ISendMailRes } from "../adapter";
import { IMailTransport } from "../transport";

type INodemailerTransportConfig = {
	smtpHost: string;
	smtpPort: number;
	domain: string;
	from: string;
	fromPass: string;
};

class NodemailerMailTransport implements IMailTransport {
	constructor(private readonly config: INodemailerTransportConfig) {}

	async sendMail({ body, subject, to }: ISendMailReq): Promise<ISendMailRes> {
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

export type { INodemailerTransportConfig };
export { NodemailerMailTransport };
