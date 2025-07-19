import { ISendMailDTO } from "./DTO";

const SendMailService = async ({ gateways, ...data }: ISendMailDTO) => {
  return await gateways.mail.sendMail({
    body: data.body,
    subject: data.subject,
    to: data.to
  });
};

export { SendMailService };
