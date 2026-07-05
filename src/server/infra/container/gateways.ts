import { env } from "@/lib/env";
import { IMailerGatewayAdapter } from "@/server/integrations/gateway/mailer/adapter";
import { MailerGateway } from "@/server/integrations/gateway/mailer/gateway";
import { ConsoleMailTransport } from "@/server/integrations/gateway/mailer/transports/console";
import { NodemailerMailTransport } from "@/server/integrations/gateway/mailer/transports/nodemailer";

type IGateways = {
	mail: IMailerGatewayAdapter;
};

const gateways: IGateways = {
	mail: new MailerGateway(
		env.mail.useProductionMailer || process.env.NODE_ENV !== "development"
			? new NodemailerMailTransport(env.mail)
			: new ConsoleMailTransport(),
	),
};

export type { IGateways };
export { gateways };
