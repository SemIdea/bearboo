import { DomainInput } from "@/server/createDomain";

const domain_sendMail = async ({
  ctx,
  input
}: DomainInput<{
  to: string | string[];
  subject: string;
  body: string;
}>) => {
  return ctx.gateways.mail.sendMail({
    body: input.body,
    subject: input.subject,
    to: input.to
  });
};

export { domain_sendMail };
