import { IUserModel } from "@/server/models/user";
import { IMailerGatewayAdapter } from "@/server/integrations/gateway/mailer/adapter";
import { SendMailService } from "./sendMail";

type Params = {
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

const SendMailByUserIdService = async ({
  userId,
  subject,
  body,
  repositories,
  gateways
}: Params) => {
  const user = await repositories.database.read(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // e.g., {{name}} will be replaced with user.name
  const newBody = body.replace(/{{(\w+)}}/g, (_, key: string) => {
    if (key in user) {
      return String((user as Record<string, unknown>)[key] ?? "");
    }
    return "";
  });

  return SendMailService({
    to: user.email,
    subject,
    body: newBody,
    gateways
  });
};

export { SendMailByUserIdService };
