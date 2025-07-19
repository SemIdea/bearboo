import {
  MAIL_DOMAIN,
  MAIL_FROM,
  MAIL_FROM_PASS,
  MAIL_SMTP_HOST,
  MAIL_SMTP_PORT
} from "@/constants";
import { IMailerGatewayAdapter, ISendMailReq } from "../adapter";
import nodemailer from "nodemailer";

class NodeMailerGateway implements IMailerGatewayAdapter {
  async sendMail({ body, subject, to }: ISendMailReq) {
    const transporter = nodemailer.createTransport({
      host: MAIL_SMTP_HOST,
      port: MAIL_SMTP_PORT,
      secure: false,
      auth: {
        user: `${MAIL_FROM}@${MAIL_DOMAIN}`,
        pass: MAIL_FROM_PASS
      }
    });

    const { pending, rejected, accepted } = await transporter.sendMail({
      from: `${MAIL_FROM}@${MAIL_DOMAIN}`,
      to,
      subject,
      html: body
    });

    return {
      status: true,
      pending: pending as string[],
      accepted: accepted as string[],
      rejected: rejected as string[]
    };
  }
}

export { NodeMailerGateway };
