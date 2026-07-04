import { ISendMailByUserIdDTO } from "./sendMailByUserId.dto";
import { SendMailService } from "./sendMail";

const SendMailByUserIdService = async ({
  userId,
  subject,
  body,
  repositories,
  gateways
}: ISendMailByUserIdDTO) => {
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
