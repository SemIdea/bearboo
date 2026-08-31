import path from "node:path";
import { config } from "dotenv";
import { getBoolEnv } from "./getBoolEnv";
import { getIntEnv } from "./getIntEnv";
import { getStrEnv } from "./getStrEnv";

config({
	path: path.resolve(__dirname, "../../../.env"),
	quiet: true,
});

const env = {
	nodeEnv: getStrEnv("NODE_ENV", "development"),
	databaseUrl: getStrEnv(
		"DATABASE_URL",
		"postgresql://postgres:postgres@localhost:5432/postgres?schema=public",
	),
	siteUrl: getStrEnv("SITE_URL", "http://localhost:3000"),
	redisUrl: getStrEnv("REDIS_URL", "redis://localhost:6379/0"),
	disableRedis: getBoolEnv("DISABLE_REDIS", false),
	mail: {
		useProductionMailer: getBoolEnv("MAIL_USE_PRODUCTION_MAILER", false),
		smtpHost: getStrEnv("MAIL_SMTP_HOST", "smtp.gmail.com"),
		smtpPort: getIntEnv("MAIL_SMTP_PORT", 587),
		domain: getStrEnv("MAIL_DOMAIN", "gmail.com"),
		from: getStrEnv("MAIL_FROM", "your_email"),
		fromPass: getStrEnv("MAIL_FROM_PASS", "your_email_password"),
	},
	media: {
		uploadDir: getStrEnv("MEDIA_UPLOAD_DIR", "public/uploads"),
		maxUploadSizeBytes: getIntEnv("MEDIA_MAX_UPLOAD_SIZE_BYTES", 5_000_000),
	},
};

export { env };
