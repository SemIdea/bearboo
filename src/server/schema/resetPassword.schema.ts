import z from "zod";

const sendResetPasswordEmailSchema = z.object({
  email: z.email("Invalid email address.")
});

const resetPasswordSchema = z
  .object({
    token: z.string("Token is required."),
    password: z
      .string("Password is required.")
      .min(8, "Password must be at least 8 characters long."),
    confirmPassword: z
      .string("Confirm Password is required.")
      .min(8, "Confirm Password must be at least 8 characters long.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

type SendResetPasswordEmailInput = z.infer<typeof sendResetPasswordEmailSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export { sendResetPasswordEmailSchema, resetPasswordSchema };
export type { SendResetPasswordEmailInput, ResetPasswordInput };
