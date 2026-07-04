import path from "node:path";
import { config } from "dotenv";
import { getIntEnv } from "./getIntEnv";
import { getStrEnv } from "./getStrEnv";

config({
	path: path.resolve(__dirname, "../../../.env"),
	quiet: true,
});

const env = {
	databaseUrl: getStrEnv(
		"DATABASE_URL",
		"postgresql://postgres:postgres@localhost:5432/postgres?schema=public",
	),
	mail: {
		smtpHost: getStrEnv("MAIL_SMTP_HOST", "smtp.gmail.com"),
		smtpPort: getIntEnv("MAIL_SMTP_PORT", 587),
		domain: getStrEnv("MAIL_DOMAIN", "gmail.com"),
		from: getStrEnv("MAIL_FROM", "your_email"),
		fromPass: getStrEnv("MAIL_FROM_PASS", "your_email_password"),
	},
};

export { env };
