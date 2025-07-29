import { z } from "zod";

const resendVerificationEmailSchema = z.object({
  email: z.email("Invalid email address.")
});

type ResendVerificationEmailInput = z.infer<
  typeof resendVerificationEmailSchema
>;

export { resendVerificationEmailSchema };
export type { ResendVerificationEmailInput };
