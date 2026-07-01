import { z } from "zod";

const refreshSessionSchema = z.object({
  refreshToken: z.string()
});

const verifyTokenSchema = z.object({
  token: z.string()
});

const resendVerificationEmailSchema = z.object({
  email: z.email("Invalid email address.")
});

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

type RefreshSessionInput = z.TypeOf<typeof refreshSessionSchema>;
type VerifyTokenInput = z.TypeOf<typeof verifyTokenSchema>;
type ResendVerificationEmailInput = z.infer<
  typeof resendVerificationEmailSchema
>;
type SendResetPasswordEmailInput = z.infer<typeof sendResetPasswordEmailSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export {
  refreshSessionSchema,
  verifyTokenSchema,
  resendVerificationEmailSchema,
  sendResetPasswordEmailSchema,
  resetPasswordSchema
};

export type {
  RefreshSessionInput,
  VerifyTokenInput,
  ResendVerificationEmailInput,
  SendResetPasswordEmailInput,
  ResetPasswordInput
};
