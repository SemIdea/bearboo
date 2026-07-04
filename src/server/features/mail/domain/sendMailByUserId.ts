import { createDomain, DomainInput } from "@/server/createDomain";
import { domain_sendMail } from "./sendMail";

const domain_sendMailByUserId = createDomain(
  async ({
    ctx,
    input
  }: DomainInput<{
    userId: string;
    subject: string;
    body: string;
  }>) => {
    const user = await ctx.repositories.user.read(input.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // e.g., {{name}} will be replaced with user.name
    const newBody = input.body.replace(/{{(\w+)}}/g, (_, key: string) => {
      if (key in user) {
        return String((user as Record<string, unknown>)[key] ?? "");
      }
      return "";
    });

    return domain_sendMail({
      ctx,
      input: {
        to: user.email,
        subject: input.subject,
        body: newBody
      }
    });
  }
);

export { domain_sendMailByUserId };
