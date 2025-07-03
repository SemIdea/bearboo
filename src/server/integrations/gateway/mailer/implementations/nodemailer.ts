import { MAIL_SMTP_HOST, MAIL_SMTP_PORT } from "@/constants";
import { IMailerGatewayAdapter, ISendMailReq } from "../adapter";
import nodemailer from "nodemailer";

class NodeMailerGateway implements IMailerGatewayAdapter {
  async sendMail({ body, from, fromPass, subject, to }: ISendMailReq) {
    const transporter = nodemailer.createTransport({
      host: MAIL_SMTP_HOST,
      port: MAIL_SMTP_PORT,
      secure: false,
      auth: {
        user: from,
        pass: fromPass
      }
    });

    const { pending, rejected, accepted } = await transporter.sendMail({
      from,
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
