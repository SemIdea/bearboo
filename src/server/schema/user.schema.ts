import { z } from "zod";

const verifyUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8)
});

const registerUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required"
    })
    .email("Invalid Email"),
  password: z
    .string({
      required_error: "Password is required"
    })
    .min(8, "Password must be at least 8 characters long")
});

const loginUserSchema = z.object({
  email: z
    .string({
      required_error: "Email is required"
    })
    .email("Invalid Email or password"),
  password: z
    .string({
      required_error: "Password is required"
    })
    .min(8, "Invalid Email or password")
});

const readUserProfileSchema = z.object({
  userId: z.string()
});

const readUserPostsSchema = z.object({
  userId: z.string()
});

const readUserCommentsSchema = z.object({
  userId: z.string()
});

type CreateUserInput = z.TypeOf<typeof registerUserSchema>;
type LoginUserInput = z.TypeOf<typeof loginUserSchema>;
type ReadUserProfileInput = z.TypeOf<typeof readUserProfileSchema>;
type ReadUserPostsInput = z.TypeOf<typeof readUserPostsSchema>;
type ReadUserCommentsInput = z.TypeOf<typeof readUserCommentsSchema>;

export {
  verifyUserSchema,
  registerUserSchema,
  loginUserSchema,
  readUserProfileSchema,
  readUserPostsSchema,
  readUserCommentsSchema
};
export type {
  CreateUserInput,
  LoginUserInput,
  ReadUserProfileInput,
  ReadUserPostsInput,
  ReadUserCommentsInput
};
