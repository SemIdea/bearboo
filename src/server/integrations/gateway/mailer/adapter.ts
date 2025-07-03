type ISendMailReq = {
  to: string | string[];
  from: string;
  fromPass: string;
  subject: string;
  body: string;
};

type ISendMailRes = {
  status: boolean;
  accepted: string[];
  rejected: string[];
  pending: string[];
};

type IMailerGatewayAdapter = {
  sendMail: (req: ISendMailReq) => Promise<ISendMailRes>;
};

export type { ISendMailReq, IMailerGatewayAdapter, ISendMailRes };
