import { IMailerGatewayAdapter } from "@/server/integrations/gateway/mailer/adapter";

type ISendMailDTO = {
  to: string | string[];
  subject: string;
  body: string;
  gateways: {
    mail: IMailerGatewayAdapter;
  };
};

export type { ISendMailDTO };
