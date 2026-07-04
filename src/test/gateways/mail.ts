import {
	IMailerGatewayAdapter,
	ISendMailReq,
	ISendMailRes,
} from "@/server/integrations/gateway/mailer/adapter";

class FakeMailerGateway implements IMailerGatewayAdapter {
	readonly sentMails: ISendMailReq[] = [];

	async sendMail(req: ISendMailReq): Promise<ISendMailRes> {
		this.sentMails.push(req);

		return {
			status: true,
			accepted: Array.isArray(req.to) ? req.to : [req.to],
			rejected: [],
			pending: [],
		};
	}
}

export { FakeMailerGateway };
