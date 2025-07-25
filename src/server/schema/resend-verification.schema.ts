import { z } from "zod";
import { AuthErrorCode } from "@/shared/error/auth";

const resendVerificationEmailSchema = z.object({
  email: z
    .string({
      required_error: AuthErrorCode.EMAIL_REQUIRED
    })
    .email(AuthErrorCode.INVALID_EMAIL)
});

type ResendVerificationEmailInput = z.infer<
  typeof resendVerificationEmailSchema
>;

export { resendVerificationEmailSchema };
export type { ResendVerificationEmailInput };
