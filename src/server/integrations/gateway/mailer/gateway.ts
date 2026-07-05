import { IMailerGatewayAdapter, ISendMailReq } from "./adapter";
import { IMailTransport } from "./transport";

class MailerGateway implements IMailerGatewayAdapter {
	constructor(private readonly transport: IMailTransport) {}

	async sendMail(req: ISendMailReq) {
		return this.transport.sendMail(req);
	}
}

export { MailerGateway };
