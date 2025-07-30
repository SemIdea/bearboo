import { GetIntEnv, GetStrEnv } from "@/utils/env";

const MAIL_SMTP_HOST = GetStrEnv("MAIL_SMTP_HOST", "smtp.gmail.com");
const MAIL_SMTP_PORT = GetIntEnv("MAIL_SMTP_PORT", 587);
const MAIL_DOMAIN = GetStrEnv("MAIL_DOMAIN", "gmail.com");
const MAIL_FROM = GetStrEnv("MAIL_FROM");
const MAIL_FROM_ACCESSTOKEN = GetStrEnv("MAIL_FROM_ACCESSTOKEN");
const MAIL_FROM_PASS = GetStrEnv("MAIL_FROM_PASS");

export {
  MAIL_SMTP_HOST,
  MAIL_SMTP_PORT,
  MAIL_DOMAIN,
  MAIL_FROM,
  MAIL_FROM_ACCESSTOKEN,
  MAIL_FROM_PASS
};
