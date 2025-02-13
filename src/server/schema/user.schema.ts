import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid Email"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters long"),
});

export const loginUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid Email or password"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Invalid Email or password"),
});

export type CreateUserInput = z.TypeOf<typeof createUserSchema>;
export type LoginUserInput = z.TypeOf<typeof loginUserSchema>;
