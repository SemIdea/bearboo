import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const createUserSchema = z.object({
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

const loginUserSchema = z.object({
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

type CreateUserInput = z.TypeOf<typeof createUserSchema>;
type LoginUserInput = z.TypeOf<typeof loginUserSchema>;

export { userSchema, createUserSchema, loginUserSchema };
export type { CreateUserInput, LoginUserInput };
