import { ISendMailReq, ISendMailRes } from "../adapter";
import { IMailTransport } from "../transport";

const extractMailLink = (body: string): string | null => {
	const linkMatch = body.match(/https?:\/\/[^"'`\s<]+/);
	return linkMatch?.[0] ?? null;
};

const extractMailCode = (body: string): string | null => {
	const tokenMatch = body.match(/[?&]token=([^"'&\s<]+)/);
	if (tokenMatch?.[1]) return tokenMatch[1];

	const pathMatch = body.match(/\/auth\/recover\/([^"'&\s<]+)/);
	if (pathMatch?.[1]) return pathMatch[1];

	return null;
};

class ConsoleMailTransport implements IMailTransport {
	async sendMail({ body, subject, to }: ISendMailReq): Promise<ISendMailRes> {
		const recipients = Array.isArray(to) ? to : [to];
		const link = extractMailLink(body);
		const code = extractMailCode(body);

		console.log("Mock email sent", {
			to: recipients,
			subject,
			link,
			code,
		});

		return {
			status: true,
			accepted: recipients,
			rejected: [],
			pending: [],
		};
	}
}

export { ConsoleMailTransport };
