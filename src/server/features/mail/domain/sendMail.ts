import { DomainInput } from "@/server/createDomain";

type Input = DomainInput<{
  to: string | string[];
  subject: string;
  body: string;
}>;

const SendMailService = async ({ ctx, ...data }: Input) => {
  return await ctx.gateways.mail.sendMail({
    body: data.body,
    subject: data.subject,
    to: data.to
  });
};

export { SendMailService };
