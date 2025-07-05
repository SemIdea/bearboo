import { z } from "zod";

const resendVerificationEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type ResendVerificationEmailInput = z.infer<
  typeof resendVerificationEmailSchema
>;

export { resendVerificationEmailSchema };
export type { ResendVerificationEmailInput };
