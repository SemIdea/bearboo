import { z } from "zod";

const verifyUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

const registerUserSchema = z.object({
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

type CreateUserInput = z.TypeOf<typeof registerUserSchema>;
type LoginUserInput = z.TypeOf<typeof loginUserSchema>;

export { verifyUserSchema, registerUserSchema, loginUserSchema };
export type { CreateUserInput, LoginUserInput };
