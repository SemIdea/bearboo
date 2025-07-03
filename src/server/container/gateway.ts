import { IMailerGatewayAdapter } from "../integrations/gateway/mailer/adapter";

import { NodeMailerGateway } from "../integrations/gateway/mailer/implementations/nodemailer";

type IGateway = {
  mail: IMailerGatewayAdapter;
};

const gateway: IGateway = {
  mail: new NodeMailerGateway()
};

export { gateway };

export type { IGateway };
