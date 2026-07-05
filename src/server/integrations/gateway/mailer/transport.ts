import type { ISendMailReq, ISendMailRes } from "./adapter";

type IMailTransport = {
	sendMail: (req: ISendMailReq) => Promise<ISendMailRes>;
};

export type { IMailTransport };
