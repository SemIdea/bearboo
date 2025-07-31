import z from "zod";

const sendResetPasswordEmailSchema = z.object({
  email: z.email("Invalid email address.")
});

const resetPasswordSchema = z.object({
  token: z.string("Token is required."),
  password: z
    .string("Password is required.")
    .min(8, "Password must be at least 8 characters long.")
});

type SendResetPasswordEmailInput = z.infer<typeof sendResetPasswordEmailSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export { sendResetPasswordEmailSchema, resetPasswordSchema };
export type { SendResetPasswordEmailInput, ResetPasswordInput };
