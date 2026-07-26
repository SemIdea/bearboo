import { env } from "@/lib/env";
import { IMailerGatewayAdapter } from "@/server/integrations/gateway/mailer/adapter";
import { MailerGateway } from "@/server/integrations/gateway/mailer/gateway";
import { ConsoleMailTransport } from "@/server/integrations/gateway/mailer/transports/console";
import { NodemailerMailTransport } from "@/server/integrations/gateway/mailer/transports/nodemailer";
import { IMediaStorageGatewayAdapter } from "@/server/integrations/gateway/mediaStorage/adapter";
import { LocalMediaStorage } from "@/server/integrations/gateway/mediaStorage/implementations/local";
import { IViewCounterGatewayAdapter } from "@/server/integrations/gateway/viewCounter/adapter";
import { InMemoryViewCounterGateway } from "@/server/integrations/gateway/viewCounter/implementations/inMemory";
import { RedisViewCounterGateway } from "@/server/integrations/gateway/viewCounter/implementations/redis";

type IGateways = {
	mail: IMailerGatewayAdapter;
	viewCounter: IViewCounterGatewayAdapter;
	mediaStorage: IMediaStorageGatewayAdapter;
};

const resolveMailGateway = (): IMailerGatewayAdapter =>
	new MailerGateway(
		env.mail.useProductionMailer || process.env.NODE_ENV !== "development"
			? new NodemailerMailTransport(env.mail)
			: new ConsoleMailTransport(),
	);

const resolveViewCounterGateway = (): IViewCounterGatewayAdapter =>
	env.disableRedis
		? new InMemoryViewCounterGateway()
		: new RedisViewCounterGateway(env.redisUrl);

const resolveMediaStorageGateway = (): IMediaStorageGatewayAdapter =>
	new LocalMediaStorage(env.media.uploadDir, env.siteUrl);

const gateways: IGateways = {
	mail: resolveMailGateway(),
	viewCounter: resolveViewCounterGateway(),
	mediaStorage: resolveMediaStorageGateway(),
};

export type { IGateways };
export { gateways };
