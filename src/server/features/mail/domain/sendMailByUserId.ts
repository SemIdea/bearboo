import { DomainInput } from "@/server/createDomain";
import { SendMailService } from "./sendMail";

type Input = DomainInput<{
  userId: string;
  subject: string;
  body: string;
}>;

const SendMailByUserIdService = async ({
  ctx,
  userId,
  subject,
  body
}: Input) => {
  const user = await ctx.repositories.user.read(userId);

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
    ctx
  });
};

export { SendMailByUserIdService };
