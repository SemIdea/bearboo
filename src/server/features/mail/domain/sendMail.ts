import { IMailerGatewayAdapter } from "@/server/integrations/gateway/mailer/adapter";

type Params = {
  to: string | string[];
  subject: string;
  body: string;
  gateways: {
    mail: IMailerGatewayAdapter;
  };
};

const SendMailService = async ({ gateways, ...data }: Params) => {
  return await gateways.mail.sendMail({
    body: data.body,
    subject: data.subject,
    to: data.to
  });
};

export { SendMailService };
