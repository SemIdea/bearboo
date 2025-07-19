import { IMailerGatewayAdapter } from "../integrations/gateway/mailer/adapter";

import { NodeMailerGateway } from "../integrations/gateway/mailer/implementations/nodemailer";

type IGateways = {
  mail: IMailerGatewayAdapter;
};

const gateways: IGateways = {
  mail: new NodeMailerGateway()
};

export { gateways };

export type { IGateways };
