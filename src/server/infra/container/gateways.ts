import { IMailerGatewayAdapter } from "@/server/integrations/gateway/mailer/adapter";

import { NodeMailerGateway } from "@/server/integrations/gateway/mailer/implementations/nodemailer";
import { env } from "@/lib/env";

type IGateways = {
  mail: IMailerGatewayAdapter;
};

const gateways: IGateways = {
  mail: new NodeMailerGateway(env.mail)
};

export { gateways };

export type { IGateways };
