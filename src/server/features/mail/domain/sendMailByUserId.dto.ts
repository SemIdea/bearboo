import { IUserModel } from "@/server/entities/user/DTO";
import { IMailerGatewayAdapter } from "@/server/integrations/gateway/mailer/adapter";

type ISendMailByUserIdDTO = {
  userId: string;
  subject: string;
  body: string;
  repositories: {
    database: IUserModel;
  };
  gateways: {
    mail: IMailerGatewayAdapter;
  };
};

export type { ISendMailByUserIdDTO };
