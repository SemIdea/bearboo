import { z } from "zod";
import { userWithoutPasswordSchema } from "../user/schema";

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

const sessionEntitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const verifyTokenEntitySchema = z.object({
  id: z.string(),
  token: z.string(),
  expiresAt: z.date(),
  userId: z.string(),
  used: z.boolean()
});

const userWithSessionSchema = userWithoutPasswordSchema.extend({
  session: z.object({
    id: z.string(),
    accessToken: z.string(),
    refreshToken: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
});

const refreshSessionOutputSchema = sessionEntitySchema;
const readUserFromSessionOutputSchema = userWithSessionSchema;
const logoutUserFromSessionOutputSchema = z.void();
const verifyTokenOutputSchema = verifyTokenEntitySchema;
const resendVerificationEmailOutputSchema = verifyTokenEntitySchema;
const resetPasswordOutputSchema = userWithoutPasswordSchema;
const sendResetPasswordEmailOutputSchema = z.object({
  success: z.boolean()
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
  resetPasswordSchema,
  sessionEntitySchema,
  verifyTokenEntitySchema,
  userWithSessionSchema,
  refreshSessionOutputSchema,
  readUserFromSessionOutputSchema,
  logoutUserFromSessionOutputSchema,
  verifyTokenOutputSchema,
  resendVerificationEmailOutputSchema,
  resetPasswordOutputSchema,
  sendResetPasswordEmailOutputSchema
};

export type {
  RefreshSessionInput,
  VerifyTokenInput,
  ResendVerificationEmailInput,
  SendResetPasswordEmailInput,
  ResetPasswordInput
};
